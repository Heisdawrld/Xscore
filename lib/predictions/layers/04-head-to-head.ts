import { getCompetitorVsCompetitor } from '@/lib/sportradar/endpoints'
import type { LayerOutput } from '../types'
import { decayWeightedAvg } from '../utils/decay'

export async function headToHeadLayer(
  homeTeamId: string,
  awayTeamId: string,
): Promise<LayerOutput | null> {
  try {
    const data = await getCompetitorVsCompetitor(homeTeamId, awayTeamId)
    const meetings = data.last_meetings?.results ?? []
    if (meetings.length < 2) return null

    // Recency-weighted results
    const weightedResults = meetings.map((m, i) => {
      const decay = Math.pow(0.85, i)
      const { winner_id, home_score, away_score } = m.sport_event_status
      const homeComp = m.sport_event.competitors.find(c => c.qualifier === 'home')
      const awayComp = m.sport_event.competitors.find(c => c.qualifier === 'away')

      let homeWin = 0, draw = 0, awayWin = 0

      if (!winner_id || home_score === away_score) {
        draw = 1
      } else if (winner_id === homeTeamId) {
        // Was the current home team actually playing at home in this H2H?
        if (homeComp?.id === homeTeamId) homeWin = 1
        else awayWin = 1  // they won but were playing away — still counts as home team winning
      } else {
        if (awayComp?.id === awayTeamId) awayWin = 1
        else homeWin = 1
      }

      const totalGoals = (home_score ?? 0) + (away_score ?? 0)
      return { homeWin, draw, awayWin, totalGoals, decay }
    })

    const totalWeight = weightedResults.reduce((s, r) => s + r.decay, 0)
    const h2hHomeWin = weightedResults.reduce((s, r) => s + r.homeWin * r.decay, 0) / totalWeight
    const h2hDraw    = weightedResults.reduce((s, r) => s + r.draw    * r.decay, 0) / totalWeight
    const h2hAwayWin = weightedResults.reduce((s, r) => s + r.awayWin * r.decay, 0) / totalWeight
    const h2hAvgGoals = decayWeightedAvg(weightedResults.map(r => r.totalGoals))

    // Data confidence scales with number of meetings
    const h2hConfidence = Math.min(1, meetings.length / 5)

    const dominant = h2hHomeWin > h2hAwayWin ? 'home' : h2hAwayWin > h2hHomeWin ? 'away' : 'neutral' as const

    return {
      home_win_prob: h2hHomeWin,
      draw_prob:     h2hDraw,
      away_win_prob: h2hAwayWin,
      confidence:    h2hConfidence,
      signals: [
        { layer: 'Head-to-Head', signal: `H2H record (${meetings.length} meetings): Home ${(h2hHomeWin*100).toFixed(0)}% Draw ${(h2hDraw*100).toFixed(0)}% Away ${(h2hAwayWin*100).toFixed(0)}%`, direction: dominant, strength: Math.abs(h2hHomeWin - h2hAwayWin) },
        { layer: 'Head-to-Head', signal: `Average total goals in H2H: ${h2hAvgGoals.toFixed(1)}`, direction: h2hAvgGoals > 2.5 ? 'neutral' : 'neutral', strength: 0.3 },
      ],
    }
  } catch {
    return null
  }
}
