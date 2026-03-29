import { NextResponse } from 'next/server'
import { getCompetitions } from '@/lib/sportradar/endpoints'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await getCompetitions()
    return NextResponse.json({ competitions: data.competitions ?? [] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
