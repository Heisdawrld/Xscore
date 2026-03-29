import { getSeasonStandings } from '@/lib/sportradar/endpoints'
import type { LayerOutput } from '../types'

const LEAGUE_AVG_HOME_WIN_RATE = 0.46
const LEAGUE_AVG_AWAY_WIN_RATE = 0.28

export async function homeAdvantageLayer(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
): Promise<LayerOutput | null> {
  try {
    const standingsRes = await getSeasonStandings(seasonId)
    const allStandings = standingsRes.standings?.[0]?.groups?.[0]?.standings ?? []

    const homeEntry = allStandings.find(s => s.competitor?.id === homeTeamId)
    const awayEntry = allStandings.find(s => s.competitor?.id === awayTeamId)
    if (!homeEntry || !awayEntry) return null

    // Extract home win rate from form string if available
    // Fallback: use win/played ratio with home-context estimation
    const homeWinRate   = homeEntry.win  / (homeEntry.played || 1)
    const awayWinRate   = awayEntry.win  / (awayEntry.played || 1)

    const homeAdvFactor  = homeWinRate   / LEAGUE_AVG_HOME_WIN_RATE
    const awayDiffFactor = awayWinRate   / LEAGUE_AVG_AWAY_WIN_RATE

    // Contextual home boost (>1 = home is stronger than average at home)
    const contextualBoost = homeAdvFactor / (awayDiffFactor + 0.01)

    // Convert boost to probability adjustment
    const rawHomeBoost = (contextualBoost - 1) * 0.08  // scale to ±8%
    const homePct  = Math.min(0.80, Math.max(0.20, 0.46 + rawHomeBoost))
    const awayPct  = Math.min(0.60, Math.max(0.10, 0.28 - rawHomeBoost * 0.5))
    const drawPct  = Math.max(0.10, 1 - homePct - awayPct)

    const direction = rawHomeBoost > 0.02 ? 'home' : rawHomeBoost < -0.02 ? 'away' : 'neutral' as const

    return {
      home_win_prob: homePct,
      draw_prob:     drawPct,
      away_win_prob: awayPct,
      confidence:    Math.min(1, homeEntry.played / 10),
      signals: [{
        layer: 'Home Advantage',
        signal: `Home win rate ${(homeWinRate*100).toFixed(0)}% vs league avg ${(LEAGUE_AVG_HOME_WIN_RATE*100).toFixed(0)}%. Away win rate ${(awayWinRate*100).toFixed(0)}%`,
        direction,
        strength: Math.abs(rawHomeBoost) * 5,
      }],
    }
  } catch {
    return null
  }
}
