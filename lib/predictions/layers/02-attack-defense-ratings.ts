import { getSeasonalCompetitorStats } from '@/lib/sportradar/endpoints'
import { scoreMatrix, matrixTo1X2, normalise } from '../utils/poisson'
import { poissonCDF } from '../utils/poisson'
import type { LayerOutput, GoalsOutput } from '../types'

const LEAGUE_AVG_GOALS = 1.35  // typical league avg goals per team per game

interface TeamStats {
  goalsScored:   number
  goalsConceded: number
  shotsOnTarget: number
  matchesPlayed: number
}

function extractStats(stats: Record<string, number>, qualifier: 'home' | 'away'): TeamStats {
  // Try to use home/away split if available, else use total
  const played = stats['matches_played'] ?? 1
  return {
    goalsScored:   stats['goals_scored']    ?? 0,
    goalsConceded: stats['goals_conceded']  ?? 0,
    shotsOnTarget: stats['shots_on_target'] ?? 0,
    matchesPlayed: played,
  }
}

export async function attackDefenseLayer(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
): Promise<{ layer: LayerOutput; goals: GoalsOutput } | null> {
  try {
    const [homeRes, awayRes] = await Promise.all([
      getSeasonalCompetitorStats(seasonId, homeTeamId),
      getSeasonalCompetitorStats(seasonId, awayTeamId),
    ])

    const homeComp = homeRes.statistics?.totals?.competitors
    const awayComp = awayRes.statistics?.totals?.competitors
    if (!homeComp || !awayComp) return null

    const homeTotals = homeComp.find(c => c.qualifier === 'home') ?? homeComp[0]
    const awayTotals = awayComp.find(c => c.qualifier === 'away') ?? awayComp[0]
    if (!homeTotals || !awayTotals) return null

    const homeStats = extractStats(homeTotals.statistics as Record<string, number>, 'home')
    const awayStats = extractStats(awayTotals.statistics as Record<string, number>, 'away')

    // Per-game rates
    const homeGoalsPerGame = homeStats.goalsScored   / homeStats.matchesPlayed
    const homeConcedePerGame = homeStats.goalsConceded / homeStats.matchesPlayed
    const awayGoalsPerGame = awayStats.goalsScored   / awayStats.matchesPlayed
    const awayConcedePerGame = awayStats.goalsConceded / awayStats.matchesPlayed

    // Dixon-Coles attack/defense ratings
    const homeAttack  = homeGoalsPerGame   / LEAGUE_AVG_GOALS
    const homeDefense = homeConcedePerGame / LEAGUE_AVG_GOALS
    const awayAttack  = awayGoalsPerGame   / LEAGUE_AVG_GOALS
    const awayDefense = awayConcedePerGame / LEAGUE_AVG_GOALS

    // Expected goals (home advantage baked into home avg)
    const xGHome = homeAttack  * awayDefense * LEAGUE_AVG_GOALS * 1.15  // +15% home advantage
    const xGAway = awayAttack  * homeDefense * LEAGUE_AVG_GOALS

    // Score probability matrix
    const matrix = scoreMatrix(xGHome, xGAway)
    const raw    = matrixTo1X2(matrix)
    const probs  = normalise(raw)

    // Goals market
    const over15 = 1 - poissonCDF(xGHome + xGAway, 1)
    const over25 = 1 - poissonCDF(xGHome + xGAway, 2)
    const over35 = 1 - poissonCDF(xGHome + xGAway, 3)
    const btts   = (1 - Math.exp(-xGHome)) * (1 - Math.exp(-xGAway))

    const dominant = probs.home > probs.away ? 'home' : probs.away > probs.home ? 'away' : 'neutral' as const

    return {
      layer: {
        home_win_prob: probs.home,
        draw_prob:     probs.draw,
        away_win_prob: probs.away,
        confidence: Math.min(1, homeStats.matchesPlayed / 10),
        signals: [
          { layer: 'Attack/Defense Ratings', signal: `xG: Home ${xGHome.toFixed(2)} vs Away ${xGAway.toFixed(2)}`, direction: dominant, strength: Math.abs(xGHome - xGAway) / 2 },
          { layer: 'Attack/Defense Ratings', signal: `Home attack ${homeAttack.toFixed(2)}x league avg, defense ${(1/homeDefense).toFixed(2)}x`, direction: probs.home > 0.45 ? 'home' : 'neutral', strength: homeAttack - 1 },
          { layer: 'Attack/Defense Ratings', signal: `Away attack ${awayAttack.toFixed(2)}x league avg, defense ${(1/awayDefense).toFixed(2)}x`, direction: probs.away > 0.35 ? 'away' : 'neutral', strength: awayAttack - 1 },
        ],
      },
      goals: {
        expected_goals_home: xGHome,
        expected_goals_away: xGAway,
        over_15_prob: over15,
        over_25_prob: over25,
        over_35_prob: over35,
        btts_prob: btts,
      },
    }
  } catch {
    return null
  }
}
