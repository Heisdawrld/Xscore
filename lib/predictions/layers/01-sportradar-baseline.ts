import { getSportEventProbabilities } from '@/lib/sportradar/endpoints'
import type { LayerOutput } from '../types'

export async function sportradarBaselineLayer(matchId: string): Promise<LayerOutput | null> {
  try {
    const data = await getSportEventProbabilities(matchId)
    const market = data.probabilities?.markets?.find(
      m => m.name === '3way' || m.name === 'match_winner'
    )
    if (!market) return null

    const home = market.outcomes.find(o => o.name === '1' || o.name.toLowerCase().includes('home'))
    const draw = market.outcomes.find(o => o.name === 'X' || o.name.toLowerCase().includes('draw'))
    const away = market.outcomes.find(o => o.name === '2' || o.name.toLowerCase().includes('away'))

    if (!home || !draw || !away) return null

    const hp = home.probability
    const dp = draw.probability
    const ap = away.probability

    const dominant = hp > ap ? 'home' : ap > hp ? 'away' : 'neutral' as const

    return {
      home_win_prob: hp,
      draw_prob:     dp,
      away_win_prob: ap,
      confidence:    1.0,
      signals: [{
        layer:     'Sportradar Baseline',
        signal:    `Market probabilities: Home ${(hp*100).toFixed(1)}% Draw ${(dp*100).toFixed(1)}% Away ${(ap*100).toFixed(1)}%`,
        direction: dominant,
        strength:  Math.abs(hp - ap),
      }],
    }
  } catch {
    return null
  }
}
