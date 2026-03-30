import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const matchId = searchParams.get('matchId')
  try {
    const db = await getDb()
    let res
    if (matchId) {
      res = await db.execute({ sql: 'SELECT * FROM predictions WHERE match_id = ? LIMIT 1', args: [matchId] })
    } else {
      res = await db.execute('SELECT * FROM predictions ORDER BY created_at DESC LIMIT 100')
    }
    return NextResponse.json({ predictions: res.rows })
  } catch (e) {
    return NextResponse.json({ error: String(e), predictions: [] }, { status: 500 })
  }
}
