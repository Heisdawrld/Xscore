import { NextResponse } from 'next/server'
import { generatePrediction } from '@/lib/predictions/engine'
import type { MatchContext } from '@/lib/predictions/types'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body: MatchContext = await req.json()
    const result = await generatePrediction(body)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
