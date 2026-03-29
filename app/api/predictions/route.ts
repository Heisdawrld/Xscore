import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const db   = await getDb()
    const res  = await db.execute('SELECT * FROM predictions ORDER BY created_at DESC LIMIT 100')
    return NextResponse.json({ predictions: res.rows })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
