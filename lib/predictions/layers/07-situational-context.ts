import { getSeasonStandings, getCompetitorSchedules } from '@/lib/sportradar/endpoints'
import type { Signal } from '../types'

export interface SituationalContext {
  varianceMultiplier: number  // >1 = more upset-prone match
  signals: Signal[]
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24)
}

export async function situationalContextLayer(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
  matchScheduled: string,
): Promise<SituationalContext> {
  const signals: Signal[] = []
  let varianceMultiplier  = 1.0

  try {
    // 1. Rest days calculation
    const [homeSchedule, awaySchedule] = await Promise.all([
      getCompetitorSchedules(homeTeamId),
      getCompetitorSchedules(awayTeamId),
    ])

    const lastHomeMatch = homeSchedule.schedules
      .filter(s => new Date(s.sport_event.scheduled) < new Date(matchScheduled))
      .sort((a, b) => new Date(b.sport_event.scheduled).getTime() - new Date(a.sport_event.scheduled).getTime())[0]

    const lastAwayMatch = awaySchedule.schedules
      .filter(s => new Date(s.sport_event.scheduled) < new Date(matchScheduled))
      .sort((a, b) => new Date(b.sport_event.scheduled).getTime() - new Date(a.sport_event.scheduled).getTime())[0]

    const homeRest = lastHomeMatch ? daysBetween(lastHomeMatch.sport_event.scheduled, matchScheduled) : 7
    const awayRest = lastAwayMatch ? daysBetween(lastAwayMatch.sport_event.scheduled, matchScheduled) : 7
    const restDelta = homeRest - awayRest

    if (Math.abs(restDelta) >= 2) {
      const fatigued = restDelta < 0 ? 'home' : 'away'
      const rested   = restDelta < 0 ? 'away' : 'home'
      varianceMultiplier += 0.05
      signals.push({ layer: 'Situational', signal: `${rested.charAt(0).toUpperCase()+rested.slice(1)} team has ${Math.abs(restDelta).toFixed(0)} more rest days`, direction: rested as 'home' | 'away', strength: Math.min(0.5, Math.abs(restDelta) * 0.1) })
    }

    // 2. Standings gap
    const standingsRes = await getSeasonStandings(seasonId)
    const allStandings = standingsRes.standings?.[0]?.groups?.[0]?.standings ?? []
    const homeRank = allStandings.find(s => s.competitor?.id === homeTeamId)?.rank ?? 10
    const awayRank = allStandings.find(s => s.competitor?.id === awayTeamId)?.rank ?? 10
    const rankGap  = Math.abs(homeRank - awayRank)

    // Large gap = mismatch = potentially boring/predictable, but also upset risk if away is higher
    if (rankGap >= 8) {
      varianceMultiplier += 0.08  // big gap teams can surprise
      signals.push({ layer: 'Situational', signal: `Large standings gap (${rankGap} places). Higher upset risk.`, direction: homeRank < awayRank ? 'home' : 'away', strength: rankGap / 20 })
    }

    // 3. Late season pressure (increases variance)
    const now = new Date(matchScheduled)
    const isLateSeason = now.getMonth() >= 3 && now.getMonth() <= 5  // Apr-Jun
    if (isLateSeason) {
      varianceMultiplier += 0.06
      signals.push({ layer: 'Situational', signal: 'Late season — higher intensity, more volatility', direction: 'neutral', strength: 0.3 })
    }

  } catch { /* non-fatal */ }

  if (signals.length === 0)
    signals.push({ layer: 'Situational', signal: 'No significant situational factors detected', direction: 'neutral', strength: 0 })

  return { varianceMultiplier, signals }
}
