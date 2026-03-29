import { NextResponse } from 'next/server'
import { getLiveSummaries } from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  try {
    const data = await getLiveSummaries()
    const matches = (data.summaries ?? []).map(s => ({
      matchId:     s.sport_event.id,
      homeTeam:    s.sport_event.competitors?.find(c => c.qualifier === 'home'),
      awayTeam:    s.sport_event.competitors?.find(c => c.qualifier === 'away'),
      homeScore:   s.sport_event_status?.home_score ?? 0,
      awayScore:   s.sport_event_status?.away_score ?? 0,
      status:      s.sport_event_status?.match_status ?? 'live',
      scheduled:   s.sport_event.scheduled,
      competition: s.sport_event.sport_event_context?.competition?.name ?? '',
    }))
    return NextResponse.json({ matches })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
