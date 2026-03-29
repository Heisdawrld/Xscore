import { NextResponse } from 'next/server'
import { getSportEventSummary, getSportEventLineups, getSportEventProbabilities, getSportEventFunFacts } from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const [summary, lineups, probs, facts] = await Promise.allSettled([
    getSportEventSummary(id),
    getSportEventLineups(id),
    getSportEventProbabilities(id),
    getSportEventFunFacts(id),
  ])

  return NextResponse.json({
    summary:  summary.status  === 'fulfilled' ? summary.value  : null,
    lineups:  lineups.status  === 'fulfilled' ? lineups.value  : null,
    probs:    probs.status    === 'fulfilled' ? probs.value    : null,
    facts:    facts.status    === 'fulfilled' ? facts.value    : null,
  })
}
