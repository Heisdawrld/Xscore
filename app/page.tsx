'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MatchCard }    from '@/components/ui/MatchCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { RefreshCw, Zap, Trophy } from 'lucide-react'

type MatchData = {
  matchId: string
  homeTeam: { id: string; name: string; abbreviation: string }
  awayTeam: { id: string; name: string; abbreviation: string }
  homeScore?: number; awayScore?: number
  status: string; minute?: number
  scheduled: string; competition: string
}

export default function HomePage() {
  const [live, setLive]       = useState<MatchData[]>([])
  const [today, setToday]     = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [liveRes, dailyRes] = await Promise.all([
        fetch('/api/matches/live').then(r => r.json()),
        fetch('/api/matches/daily').then(r => r.json()),
      ])
      setLive(liveRes.matches  ?? [])
      setToday(dailyRes.matches ?? [])
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData, 30_000)  // refresh live every 30s
    return () => clearInterval(iv)
  }, [fetchData])

  const scheduled = today.filter(m => m.status === 'not_started')
  const finished  = today.filter(m => ['closed','ended'].includes(m.status))

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Match Centre</h1>
          <p className="text-text-secondary mt-1 text-sm">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData() }}
          className="p-2.5 rounded-xl bg-surface-2 border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Live Section */}
      {(loading || live.length > 0) && (
        <section>
          <SectionHeader icon={<Zap size={16} className="text-live" />} title="Live Now" count={live.length} color="live" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} rows={2} />)
              : live.map((m, i) => (
                <MatchCard key={m.matchId} {...m} index={i} />
              ))
            }
          </div>
        </section>
      )}

      {/* Today Scheduled */}
      {(loading || scheduled.length > 0) && (
        <section>
          <SectionHeader icon={<Trophy size={16} className="text-gold" />} title="Today" count={scheduled.length} color="gold" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={2} />)
              : scheduled.map((m, i) => (
                <MatchCard key={m.matchId} {...m} index={i} />
              ))
            }
          </div>
        </section>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <section>
          <SectionHeader title="Results" count={finished.length} color="muted" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {finished.map((m, i) => (
              <MatchCard key={m.matchId} {...m} index={i} />
            ))}
          </div>
        </section>
      )}

      {!loading && live.length === 0 && scheduled.length === 0 && finished.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-text-muted text-lg">No matches found for today.</p>
          <p className="text-text-muted text-sm mt-2">Check back later or browse a specific date.</p>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ icon, title, count, color }: { icon?: React.ReactNode; title: string; count: number; color: string }) {
  const colors: Record<string, string> = { live: 'text-live', gold: 'text-gold', muted: 'text-text-muted' }
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
      <span className={`text-sm font-medium ${colors[color] ?? 'text-text-secondary'}`}>({count})</span>
    </div>
  )
}
