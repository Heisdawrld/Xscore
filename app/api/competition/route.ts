import { NextResponse } from 'next/server'
import {
  getCompetitionInfo, getSeasonStandings,
  getSeasonSchedule, getSeasonLeaders,
} from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id  = searchParams.get('id') ?? ''
  const tab = searchParams.get('tab') ?? 'Schedule'

  try {
    // Get competition info + current season
    const info = await getCompetitionInfo(id)
    const season = info.seasons?.[0]
    const name   = info.competition?.name ?? ''

    if (!season) return NextResponse.json({ name, matches:[], standings:[], leaders:[] })

    if (tab === 'Schedule') {
      const sched = await getSeasonSchedule(season.id)
      const matches = (sched.schedules ?? []).slice(0, 50).map((s: { sport_event: { id:string; competitors?: Array<{id:string;name:string;abbreviation:string;qualifier:string}>; scheduled:string; sport_event_context?: {competition?:{name:string}} }; sport_event_status: {home_score?:number;away_score?:number;match_status?:string} }) => ({
        matchId:    s.sport_event.id,
        homeTeam:   s.sport_event.competitors?.find((c:{qualifier:string}) => c.qualifier === 'home'),
        awayTeam:   s.sport_event.competitors?.find((c:{qualifier:string}) => c.qualifier === 'away'),
        homeScore:  s.sport_event_status?.home_score,
        awayScore:  s.sport_event_status?.away_score,
        status:     s.sport_event_status?.match_status ?? 'not_started',
        scheduled:  s.sport_event.scheduled,
        competition: name,
      }))
      return NextResponse.json({ name, matches })
    }

    if (tab === 'Standings') {
      const data = await getSeasonStandings(season.id)
      const standings = data.standings?.[0]?.groups?.[0]?.standings ?? []
      return NextResponse.json({ name, standings })
    }

    if (tab === 'Leaders') {
      const data = await getSeasonLeaders(season.id)
      return NextResponse.json({ name, leaders: data.leaders ?? [] })
    }

    return NextResponse.json({ name })
  } catch (e) {
    console.error('Competition API error:', e)
    return NextResponse.json({ error: String(e), name:'', matches:[], standings:[], leaders:[] }, { status: 500 })
  }
}
