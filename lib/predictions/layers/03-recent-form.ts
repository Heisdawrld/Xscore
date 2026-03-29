import { getCompetitorSummaries } from '@/lib/sportradar/endpoints'
import { formScore, decayWeightedAvg } from '../utils/decay'
import { blendProbabilities } from '../utils/normalize'
import type { LayerOutput } from '../types'

function getResultFromSummary(summary: { sport_event: { competitors: Array<{ id: string; qualifier: string }> }; sport_event_status: { home_score: number; away_score: number; winner_id?: string } }, teamId: string): 'W' | 'D' | 'L' {
  const { home_score, away_score, winner_id } = summary.sport_event_status
  if (!winner_id) return 'D'
  const comp = summary.sport_event.competitors.find(c => c.id === teamId)
  if (!comp) return 'D'
  if (winner_id === teamId) return 'W'
  if (home_score === away_score) return 'D'
  return 'L'
}

export async function recentFormLayer(
  homeTeamId: string,
  awayTeamId: string,
): Promise<LayerOutput | null> {
  try {
    const [homeRes, awayRes] = await Promise.all([
      getCompetitorSummaries(homeTeamId),
      getCompetitorSummaries(awayTeamId),
    ])

    // Take last 10 completed matches
    const homeMatches = homeRes.summaries
      .filter(s => ['closed', 'ended'].includes(s.sport_event_status?.match_status ?? ''))
      .slice(0, 10)
    const awayMatches = awayRes.summaries
      .filter(s => ['closed', 'ended'].includes(s.sport_event_status?.match_status ?? ''))
      .slice(0, 10)

    if (homeMatches.length < 3 || awayMatches.length < 3) return null

    const homeResults = homeMatches.map(s => getResultFromSummary(s, homeTeamId))
    const awayResults = awayMatches.map(s => getResultFromSummary(s, awayTeamId))

    const homeFormScore = formScore(homeResults)
    const awayFormScore = formScore(awayResults)

    // Goals momentum
    const homeGoalsMomentum = decayWeightedAvg(
      homeMatches.map(s => {
        const comp = s.sport_event.competitors.find(c => c.id === homeTeamId)
        return comp?.qualifier === 'home' ? s.sport_event_status.home_score : s.sport_event_status.away_score
      })
    )
    const awayGoalsMomentum = decayWeightedAvg(
      awayMatches.map(s => {
        const comp = s.sport_event.competitors.find(c => c.id === awayTeamId)
        return comp?.qualifier === 'home' ? s.sport_event_status.home_score : s.sport_event_status.away_score
      })
    )

    // Convert form scores to probability adjustments
    // Base: 40% home, 25% draw, 35% away (league averages)
    const formDelta   = homeFormScore - awayFormScore  // -1 to +1
    const homeBoost   = formDelta * 0.15
    const awayBoost   = -formDelta * 0.10

    const probs = blendProbabilities([
      { home: 0.40 + homeBoost, draw: 0.25, away: 0.35 + awayBoost, weight: 1 },
    ])

    const formWinner = homeFormScore > awayFormScore ? 'home' : awayFormScore > homeFormScore ? 'away' : 'neutral' as const

    return {
      home_win_prob: probs.home,
      draw_prob:     probs.draw,
      away_win_prob: probs.away,
      confidence:    Math.min(1, Math.min(homeMatches.length, awayMatches.length) / 8),
      signals: [
        { layer: 'Recent Form', signal: `Home form: ${homeResults.slice(0,5).join('')} (score ${homeFormScore.toFixed(2)})`, direction: homeFormScore > 0.6 ? 'home' : homeFormScore < 0.3 ? 'away' : 'neutral', strength: homeFormScore },
        { layer: 'Recent Form', signal: `Away form: ${awayResults.slice(0,5).join('')} (score ${awayFormScore.toFixed(2)})`, direction: awayFormScore > 0.6 ? 'away' : awayFormScore < 0.3 ? 'home' : 'neutral', strength: awayFormScore },
        { layer: 'Recent Form', signal: `Goals momentum: Home ${homeGoalsMomentum.toFixed(1)} vs Away ${awayGoalsMomentum.toFixed(1)}`, direction: formWinner, strength: Math.abs(homeFormScore - awayFormScore) },
      ],
    }
  } catch {
    return null
  }
}
