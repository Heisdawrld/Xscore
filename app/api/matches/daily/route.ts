import { NextResponse } from 'next/server'
import { getDailySummaries, getDailySchedule } from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const today = new Date().toISOString().slice(0, 10)
  const date  = searchParams.get('date') ?? today

  try {
    // Try summaries first (has scores), fall back to schedule
    let matches: unknown[] = []
    try {
      const data = await getDailySummaries(date)
      matches = (data.summaries ?? []).map((s: { sport_event: { id: string; competitors?: Array<{id:string;name:string;abbreviation:string;qualifier:string}>; scheduled: string; sport_event_context?: { competition?: { id:string; name:string } } }; sport_event_status: { home_score?: number; away_score?: number; match_status?: string } }) => ({
        matchId:       s.sport_event.id,
        homeTeam:      s.sport_event.competitors?.find((c: {qualifier:string}) => c.qualifier === 'home'),
        awayTeam:      s.sport_event.competitors?.find((c: {qualifier:string}) => c.qualifier === 'away'),
        homeScore:     s.sport_event_status?.home_score,
        awayScore:     s.sport_event_status?.away_score,
        status:        s.sport_event_status?.match_status ?? 'scheduled',
        scheduled:     s.sport_event.scheduled,
        competition:   s.sport_event.sport_event_context?.competition?.name ?? '',
        competitionId: s.sport_event.sport_event_context?.competition?.id ?? '',
      }))
    } catch {
      const data = await getDailySchedule(date)
      matches = (data.schedule ?? []).map((s: { id: string; competitors?: Array<{id:string;name:string;abbreviation:string;qualifier:string}>; scheduled: string; sport_event_context?: { competition?: { id:string; name:string } } }) => ({
        matchId:       s.id,
        homeTeam:      s.competitors?.find((c: {qualifier:string}) => c.qualifier === 'home'),
        awayTeam:      s.competitors?.find((c: {qualifier:string}) => c.qualifier === 'away'),
        status:        'not_started',
        scheduled:     s.scheduled,
        competition:   s.sport_event_context?.competition?.name ?? '',
        competitionId: s.sport_event_context?.competition?.id ?? '',
      }))
    }
    return NextResponse.json({ matches, date, count: matches.length })
  } catch (e) {
    console.error('Daily matches error:', e)
    return NextResponse.json({ error: String(e), matches: [], date }, { status: 500 })
  }
}
