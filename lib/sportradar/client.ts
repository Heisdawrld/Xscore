/**
 * Sportradar Soccer v4 — typed API client with Turso caching
 * All responses are cached in Turso to manage rate limits.
 */

import { getDb } from '@/lib/db/client'

const BASE_URL = process.env.SPORTRADAR_BASE_URL ?? 'https://api.sportradar.com/soccer/trial/v4/en'
const API_KEY  = process.env.SPORTRADAR_API_KEY ?? ''

// Default TTLs (seconds) per feed type
const TTL = {
  live:           15,    // live schedules / summaries — very fresh
  daily:          300,   // daily schedules / summaries
  standings:      600,
  season:         1800,
  competitor:     1800,
  player:         3600,
  competitions:   86400, // competitions list — rarely changes
  probabilities:  60,    // probabilities update frequently pre-match
  timeline:       10,    // live timeline delta
} as const

type TtlKey = keyof typeof TTL

interface FetchOptions {
  ttl?: TtlKey
  bypassCache?: boolean
}

// ─────────────────────────────────────────────────────────
// Core fetch with Turso cache
// ─────────────────────────────────────────────────────────
export async function sportradarFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { ttl = 'daily', bypassCache = false } = options
  const ttlSeconds = TTL[ttl]
  const cacheKey   = `sr:${path}`
  const now        = Math.floor(Date.now() / 1000)

  // 1. Check cache
  if (!bypassCache) {
    const db     = await getDb()
    const cached = await db.execute({
      sql: 'SELECT data, fetched_at FROM api_cache WHERE key = ?',
      args: [cacheKey],
    })

    if (cached.rows.length > 0) {
      const row       = cached.rows[0]
      const fetchedAt = Number(row.fetched_at)

      if (now - fetchedAt < ttlSeconds) {
        return JSON.parse(row.data as string) as T
      }
    }
  }

  // 2. Fetch from Sportradar
  const encodedPath = path.replace(/sr:[a-z_]+:[0-9]+/g, (m) => encodeURIComponent(m))
  const url = `${BASE_URL}${encodedPath}${encodedPath.includes('?') ? '&' : '?'}api_key=${API_KEY}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 }, // disable Next.js cache — we handle caching ourselves
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new SportradarError(res.status, path, msg)
  }

  const data = await res.json() as T

  // 3. Write to Turso cache
  const db = await getDb()
  await db.execute({
    sql: `INSERT INTO api_cache (key, data, fetched_at, ttl_seconds)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at, ttl_seconds = excluded.ttl_seconds`,
    args: [cacheKey, JSON.stringify(data), now, ttlSeconds],
  })

  return data
}

export class SportradarError extends Error {
  constructor(
    public status: number,
    public path: string,
    public detail: string,
  ) {
    super(`Sportradar ${status} on ${path}: ${detail}`)
    this.name = 'SportradarError'
  }
}
