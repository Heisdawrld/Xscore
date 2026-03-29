import { NextResponse } from 'next/server'
import { getDailySummaries } from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const today = new Date().toISOString().slice(0, 10)
  const date  = searchParams.get('date') ?? today
  try {
    const data = await getDailySummaries(date)
    const matches = (data.summaries ?? []).map(s => ({
      matchId:     s.sport_event.id,
      homeTeam:    s.sport_event.competitors?.find(c => c.qualifier === 'home'),
      awayTeam:    s.sport_event.competitors?.find(c => c.qualifier === 'away'),
      homeScore:   s.sport_event_status?.home_score,
      awayScore:   s.sport_event_status?.away_score,
      status:      s.sport_event_status?.match_status ?? 'scheduled',
      scheduled:   s.sport_event.scheduled,
      competition: s.sport_event.sport_event_context?.competition?.name ?? '',
      competitionId: s.sport_event.sport_event_context?.competition?.id ?? '',
    }))
    return NextResponse.json({ matches, date })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
