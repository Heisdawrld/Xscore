/**
 * Robust date parser — handles Sportradar's ISO 8601 format with timezone offsets.
 * iOS Safari fails on strings like "2026-03-30T20:00:00+00:00" so we normalise first.
 */
export function parseDate(s: unknown): Date | null {
  if (!s) return null
  let str = String(s).trim()

  // Replace space-separated datetime with T
  str = str.replace(' ', 'T')

  // iOS Safari fix: timezone offset like +05:30 → keep as is, but
  // some builds fail on +00:00 — normalise to Z
  str = str.replace(/\+00:00$/, 'Z')

  // Try native parse
  let d = new Date(str)
  if (!isNaN(d.getTime())) return d

  // Fallback: strip timezone and parse as UTC
  const noTz = str.replace(/[+-]\d{2}:\d{2}$/, '').replace('Z', '')
  d = new Date(noTz + 'Z')
  if (!isNaN(d.getTime())) return d

  return null
}

/** "20:00" */
export function formatTime(s: unknown): string {
  const d = parseDate(s)
  if (!d) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

/** "Mon 30 Mar · 20:00" */
export function formatDateTime(s: unknown): string {
  const d = parseDate(s)
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', timeZone:'UTC' }) +
         ' · ' +
         d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone:'UTC' })
}

/** "Mon 30 Mar" */
export function formatDate(s: unknown): string {
  const d = parseDate(s)
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric', timeZone:'UTC' })
}
