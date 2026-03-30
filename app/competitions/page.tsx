'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Globe } from 'lucide-react'

type Competition = { id: string; name: string; gender?: string; category?: { name: string; country_code?: string } }

const FLAG = (code?: string) => code ? `https://flagcdn.com/24x18/${code.toLowerCase()}.png` : null

export default function CompetitionsPage() {
  const [comps, setComps]     = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')

  useEffect(() => {
    fetch('/api/competitions').then(r => r.json()).then(d => { setComps(d.competitions ?? []); setLoading(false) })
  }, [])

  const filtered = comps.filter(c =>
    !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.category?.name.toLowerCase().includes(query.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Competition[]>>((acc, c) => {
    const key = c.category?.name ?? 'Other'
    ;(acc[key] ??= []).push(c)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Competitions</h1>
          <p className="text-text-secondary text-sm mt-1">650+ competitions worldwide</p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search competitions..."
          className="ml-auto bg-surface-2 border border-border rounded-xl px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 w-64"
        />
      </div>

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, list]) => (
            <div key={region}>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-text-muted" />
                <h2 className="text-sm font-semibold text-text-secondary">{region}</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {list.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <Link href={`/competition/${c.id.replace('sr:competition:', '')}`}>
                      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary/20 hover:shadow-card-hover transition-all cursor-pointer group">
                        <Trophy size={14} className="text-gold flex-shrink-0" />
                        <span className="text-sm text-text-primary group-hover:text-primary transition-colors truncate">{c.name}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
