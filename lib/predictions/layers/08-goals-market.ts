import { getSeasonOverUnder } from '@/lib/sportradar/endpoints'
import { poissonCDF } from '../utils/poisson'
import type { GoalsOutput } from '../types'

export async function goalsMarketLayer(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  xGHome: number,
  xGAway: number,
): Promise<GoalsOutput> {
  let adjustedXGHome = xGHome
  let adjustedXGAway = xGAway

  try {
    const ouRes = await getSeasonOverUnder(seasonId)
    const homeOU = ouRes.over_under_statistics?.find(s => s.competitor?.id === homeTeamId)
    const awayOU = ouRes.over_under_statistics?.find(s => s.competitor?.id === awayTeamId)

    // Use team's historical over rate to calibrate xG
    if (homeOU?.totals) {
      const total25  = homeOU.totals['total_2_5']
      const overRate = total25 ? total25.over / (total25.over + total25.under) : 0.5
      // Blend xG with historical rate: if team has 70% over 2.5 rate, boost xG slightly
      adjustedXGHome = adjustedXGHome * (0.8 + overRate * 0.4)
    }

    if (awayOU?.totals) {
      const total25  = awayOU.totals['total_2_5']
      const overRate = total25 ? total25.over / (total25.over + total25.under) : 0.5
      adjustedXGAway = adjustedXGAway * (0.8 + overRate * 0.4)
    }
  } catch { /* use raw xG */ }

  const totalXG = adjustedXGHome + adjustedXGAway

  return {
    expected_goals_home: adjustedXGHome,
    expected_goals_away: adjustedXGAway,
    over_15_prob: 1 - poissonCDF(totalXG, 1),
    over_25_prob: 1 - poissonCDF(totalXG, 2),
    over_35_prob: 1 - poissonCDF(totalXG, 3),
    btts_prob:    (1 - Math.exp(-adjustedXGHome)) * (1 - Math.exp(-adjustedXGAway)),
  }
}
