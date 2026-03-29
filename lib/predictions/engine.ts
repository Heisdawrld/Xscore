import { randomUUID } from 'crypto'
import { sportradarBaselineLayer }  from './layers/01-sportradar-baseline'
import { attackDefenseLayer }        from './layers/02-attack-defense-ratings'
import { recentFormLayer }           from './layers/03-recent-form'
import { headToHeadLayer }           from './layers/04-head-to-head'
import { squadAvailabilityLayer }    from './layers/05-squad-availability'
import { homeAdvantageLayer }        from './layers/06-home-advantage'
import { situationalContextLayer }   from './layers/07-situational-context'
import { goalsMarketLayer }          from './layers/08-goals-market'
import { varianceUpsetLayer }        from './layers/09-variance-upset'
import { blendProbabilities }        from './utils/normalize'
import { clamp }                     from './utils/normalize'
import { getDb }                     from '@/lib/db/client'
import type { PredictionResult, MatchContext, LayerOutput, GoalsOutput } from './types'

const MODEL_VERSION = '1.0.0'

// Layer weights (must sum to 1.0)
const WEIGHTS = {
  baseline:       0.20,
  attackDefense:  0.20,
  recentForm:     0.18,
  h2h:            0.12,
  homeAdvantage:  0.10,
  situational:    0.08,
  squadFallback:  0.12,  // distributes to other layers when squad data modifies attack ratings
}

export async function generatePrediction(ctx: MatchContext): Promise<PredictionResult> {
  const {
    matchId, homeTeamId, awayTeamId,
    seasonId, competitionId, scheduled,
  } = ctx

  // ─────────────────────────────────────────────────────────
  // Run all layers concurrently
  // ─────────────────────────────────────────────────────────
  const [
    baseline,
    adResult,
    recentForm,
    h2h,
    squadPenalty,
    homeAdv,
    situational,
  ] = await Promise.allSettled([
    sportradarBaselineLayer(matchId),
    attackDefenseLayer(homeTeamId, awayTeamId, seasonId),
    recentFormLayer(homeTeamId, awayTeamId),
    headToHeadLayer(homeTeamId, awayTeamId),
    squadAvailabilityLayer(homeTeamId, awayTeamId, seasonId),
    homeAdvantageLayer(homeTeamId, awayTeamId, seasonId),
    situationalContextLayer(homeTeamId, awayTeamId, seasonId, scheduled),
  ])

  // Unwrap settled results
  const baselineLayer   = baseline.status   === 'fulfilled' ? baseline.value   : null
  const adLayer         = adResult.status   === 'fulfilled' ? adResult.value   : null
  const formLayer       = recentForm.status === 'fulfilled' ? recentForm.value : null
  const h2hLayer        = h2h.status        === 'fulfilled' ? h2h.value        : null
  const squad           = squadPenalty.status === 'fulfilled' ? squadPenalty.value : { homePenalty: 0, awayPenalty: 0, signals: [] }
  const homeAdvLayer    = homeAdv.status    === 'fulfilled' ? homeAdv.value    : null
  const situCtx         = situational.status === 'fulfilled' ? situational.value : { varianceMultiplier: 1, signals: [] }

  // Squad penalty modifies the attack/defense layer output
  let modifiedAdLayer: LayerOutput | null = adLayer?.layer ?? null
  let goalsData: GoalsOutput | null       = adLayer?.goals ?? null

  if (modifiedAdLayer && (squad.homePenalty > 0 || squad.awayPenalty > 0)) {
    // Shift probs based on squad penalties
    const homePenaltyShift = squad.homePenalty * 0.25   // up to 25% probability shift
    const awayPenaltyShift = squad.awayPenalty * 0.20
    modifiedAdLayer = {
      ...modifiedAdLayer,
      home_win_prob: clamp(modifiedAdLayer.home_win_prob - homePenaltyShift + awayPenaltyShift * 0.5),
      away_win_prob: clamp(modifiedAdLayer.away_win_prob - awayPenaltyShift + homePenaltyShift * 0.5),
    }
    // Reduce xG for injured-team
    if (goalsData) {
      goalsData = {
        ...goalsData,
        expected_goals_home: goalsData.expected_goals_home * (1 - squad.homePenalty * 0.35),
        expected_goals_away: goalsData.expected_goals_away * (1 - squad.awayPenalty * 0.35),
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // Goals market (Layer 8) with calibration
  // ─────────────────────────────────────────────────────────
  const xGHome = goalsData?.expected_goals_home ?? 1.35
  const xGAway = goalsData?.expected_goals_away ?? 1.10

  const goalsMarket = await goalsMarketLayer(homeTeamId, awayTeamId, seasonId, xGHome, xGAway)

  // ─────────────────────────────────────────────────────────
  // Layer 10: Ensemble Weighting
  // ─────────────────────────────────────────────────────────
  const layersForBlend: Array<{ home: number; draw: number; away: number; weight: number }> = []
  let dataPointsAvailable = 0

  const addLayer = (layer: LayerOutput | null, baseWeight: number) => {
    if (!layer) return
    const effectiveWeight = baseWeight * layer.confidence
    layersForBlend.push({ home: layer.home_win_prob, draw: layer.draw_prob, away: layer.away_win_prob, weight: effectiveWeight })
    dataPointsAvailable++
  }

  addLayer(baselineLayer,   WEIGHTS.baseline)
  addLayer(modifiedAdLayer, WEIGHTS.attackDefense)
  addLayer(formLayer,       WEIGHTS.recentForm)
  addLayer(h2hLayer,        WEIGHTS.h2h)
  addLayer(homeAdvLayer,    WEIGHTS.homeAdvantage)

  // Situational context modifies variance but not 1X2 directly
  // If no layers available, use league averages as fallback
  if (layersForBlend.length === 0) {
    layersForBlend.push({ home: 0.46, draw: 0.26, away: 0.28, weight: 1 })
  }

  const blended = blendProbabilities(layersForBlend)

  // Determine predicted outcome
  const predicted_outcome = blended.home > blended.away && blended.home > blended.draw
    ? 'home'
    : blended.away > blended.home && blended.away > blended.draw
    ? 'away'
    : 'draw'

  // Variance & Upset (Layer 9)
  const allLayers = [baselineLayer, modifiedAdLayer, formLayer, h2hLayer, homeAdvLayer]
  const variance  = varianceUpsetLayer(allLayers, situCtx.varianceMultiplier)

  // Data completeness
  const dataCompleteness = clamp(dataPointsAvailable / 5)

  // ─────────────────────────────────────────────────────────
  // Collect all signals
  // ─────────────────────────────────────────────────────────
  const allSignals = [
    ...(baselineLayer?.signals   ?? []),
    ...(modifiedAdLayer?.signals ?? []),
    ...(formLayer?.signals       ?? []),
    ...(h2hLayer?.signals        ?? []),
    ...squad.signals,
    ...(homeAdvLayer?.signals    ?? []),
    ...situCtx.signals,
    ...variance.signals,
  ]

  const result: PredictionResult = {
    match_id:            matchId,
    home_team:           '',   // caller fills these
    away_team:           '',
    home_team_id:        homeTeamId,
    away_team_id:        awayTeamId,
    scheduled,
    competition_id:      competitionId,
    generated_at:        new Date().toISOString(),

    home_win_prob:       blended.home,
    draw_prob:           blended.draw,
    away_win_prob:       blended.away,
    predicted_outcome,

    expected_goals_home: goalsMarket.expected_goals_home,
    expected_goals_away: goalsMarket.expected_goals_away,
    over_15_prob:        goalsMarket.over_15_prob,
    over_25_prob:        goalsMarket.over_25_prob,
    over_35_prob:        goalsMarket.over_35_prob,
    btts_prob:           goalsMarket.btts_prob,

    confidence_score:    variance.confidenceScore,
    volatility:          variance.volatility,
    upset_risk:          variance.upsetRisk,

    signals:             allSignals,
    data_completeness:   dataCompleteness,
    model_version:       MODEL_VERSION,
  }

  // Persist to Turso
  await persistPrediction(result)

  return result
}

async function persistPrediction(p: PredictionResult) {
  try {
    const db = await getDb()
    const id = randomUUID()
    await db.execute({
      sql: `INSERT OR REPLACE INTO predictions
            (id, match_id, home_team_id, away_team_id, scheduled, competition_id,
             predicted_outcome, confidence, home_win_prob, draw_prob, away_win_prob,
             expected_goals_home, expected_goals_away, over_15_prob, over_25_prob, over_35_prob,
             btts_prob, volatility, upset_risk, signals, data_completeness, model_version, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id, p.match_id, p.home_team_id, p.away_team_id, p.scheduled, p.competition_id ?? null,
        p.predicted_outcome, p.confidence_score / 100, p.home_win_prob, p.draw_prob, p.away_win_prob,
        p.expected_goals_home, p.expected_goals_away, p.over_15_prob, p.over_25_prob, p.over_35_prob,
        p.btts_prob, p.volatility, p.upset_risk,
        JSON.stringify(p.signals), p.data_completeness, p.model_version,
        Math.floor(Date.now() / 1000),
      ],
    })
  } catch { /* non-fatal */ }
}
