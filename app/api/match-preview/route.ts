import { NextResponse } from 'next/server'
import {
  getCompetitorVsCompetitor,
  getCompetitorSummaries,
  getSeasonalCompetitorStats,
  getSeasonMissingPlayers,
  getSeasonStandings,
} from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const homeId   = searchParams.get('homeId')   ?? ''
  const awayId   = searchParams.get('awayId')   ?? ''
  const seasonId = searchParams.get('seasonId') ?? ''

  const [h2hRes, homeFormRes, awayFormRes, homeStatsRes, awayStatsRes, missingRes, standingsRes] =
    await Promise.allSettled([
      getCompetitorVsCompetitor(homeId, awayId),
      getCompetitorSummaries(homeId),
      getCompetitorSummaries(awayId),
      seasonId ? getSeasonalCompetitorStats(seasonId, homeId) : Promise.reject('no season'),
      seasonId ? getSeasonalCompetitorStats(seasonId, awayId) : Promise.reject('no season'),
      seasonId ? getSeasonMissingPlayers(seasonId)             : Promise.reject('no season'),
      seasonId ? getSeasonStandings(seasonId)                  : Promise.reject('no season'),
    ])

  // ---- H2H ----
  const h2hMeetings = h2hRes.status === 'fulfilled'
    ? (h2hRes.value.last_meetings?.results ?? []).slice(0, 6).map((m) => ({
        matchId:    m.sport_event.id,
        homeTeam:   m.sport_event.competitors?.find(c => c.qualifier === 'home')?.name ?? '',
        awayTeam:   m.sport_event.competitors?.find(c => c.qualifier === 'away')?.name ?? '',
        homeScore:  m.sport_event_status?.home_score,
        awayScore:  m.sport_event_status?.away_score,
        winnerId:   m.sport_event_status?.winner_id,
        scheduled:  m.sport_event.scheduled,
        competition: m.sport_event.sport_event_context?.competition?.name ?? '',
      }))
    : []

  // ---- Form helpers ----
  const extractForm = (res: typeof homeFormRes, teamId: string) => {
    if (res.status !== 'fulfilled') return []
    return res.value.summaries
      .filter(s => ['closed','ended','complete'].includes(s.sport_event_status?.match_status ?? ''))
      .slice(0, 6)
      .map(s => {
        const isHome    = s.sport_event.competitors?.find(c => c.id === teamId)?.qualifier === 'home'
        const homeScore = s.sport_event_status?.home_score ?? 0
        const awayScore = s.sport_event_status?.away_score ?? 0
        const myScore   = isHome ? homeScore : awayScore
        const opScore   = isHome ? awayScore : homeScore
        const opponent  = s.sport_event.competitors?.find(c => c.id !== teamId)?.name ?? ''
        const result    = myScore > opScore ? 'W' : myScore < opScore ? 'L' : 'D'
        return { result, myScore, opScore, opponent, scheduled: s.sport_event.scheduled }
      })
  }

  // ---- Season stats ----
  const extractSeasonStats = (res: typeof homeStatsRes) => {
    if (res.status !== 'fulfilled') return null
    const comps = res.value.statistics?.totals?.competitors ?? []
    const all   = comps.find((c: { qualifier: string }) => c.qualifier === 'total') ?? comps[0]
    return (all as { statistics?: Record<string, number> })?.statistics ?? null
  }

  // ---- Missing players ----
  const missing = missingRes.status === 'fulfilled' ? missingRes.value.missing_players ?? [] : []
  const homeMissing = missing.find((m: { competitor: { id: string } }) => m.competitor?.id === homeId)
  const awayMissing = missing.find((m: { competitor: { id: string } }) => m.competitor?.id === awayId)

  // ---- Standings ----
  const standings   = standingsRes.status === 'fulfilled'
    ? standingsRes.value.standings?.[0]?.groups?.[0]?.standings ?? []
    : []
  const homeStanding = standings.find((s: { competitor: { id: string } }) => s.competitor?.id === homeId)
  const awayStanding = standings.find((s: { competitor: { id: string } }) => s.competitor?.id === awayId)

  return NextResponse.json({
    h2h: h2hMeetings,
    homeForm:     extractForm(homeFormRes, homeId),
    awayForm:     extractForm(awayFormRes, awayId),
    homeStats:    extractSeasonStats(homeStatsRes),
    awayStats:    extractSeasonStats(awayStatsRes),
    homeMissing:  homeMissing?.players ?? [],
    awayMissing:  awayMissing?.players ?? [],
    homeStanding: homeStanding ?? null,
    awayStanding: awayStanding ?? null,
  })
}
