import { NextResponse } from 'next/server'
import { getCompetitorProfile, getCompetitorSchedules } from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id  = searchParams.get('id') ?? ''
  const tab = searchParams.get('tab') ?? 'Overview'

  try {
    const [profileRes, schedRes] = await Promise.allSettled([
      getCompetitorProfile(id),
      getCompetitorSchedules(id),
    ])

    const profile  = profileRes.status  === 'fulfilled' ? profileRes.value  : null
    const schedules = schedRes.status === 'fulfilled' ? schedRes.value : null

    const players = (profile as unknown as Record<string,unknown>|null)?.competitor && ((profile as unknown as Record<string,unknown>).competitor as Record<string,unknown>)?.players

    const matches = (schedules?.schedules ?? []).slice(0, 20).map((s: {sport_event:{id:string;competitors?:Array<{id:string;name:string;abbreviation:string;qualifier:string}>;scheduled:string;sport_event_context?:{competition?:{name:string}}};sport_event_status:{home_score?:number;away_score?:number;match_status?:string}}) => ({
      matchId:    s.sport_event.id,
      homeTeam:   s.sport_event.competitors?.find((c:{qualifier:string})=>c.qualifier==='home'),
      awayTeam:   s.sport_event.competitors?.find((c:{qualifier:string})=>c.qualifier==='away'),
      homeScore:  s.sport_event_status?.home_score,
      awayScore:  s.sport_event_status?.away_score,
      status:     s.sport_event_status?.match_status ?? 'not_started',
      scheduled:  s.sport_event.scheduled,
      competition: s.sport_event.sport_event_context?.competition?.name ?? '',
    }))

    return NextResponse.json({ profile, players, matches })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
