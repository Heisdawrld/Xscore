'use client'
import { useState } from 'react'
import { Search, Bell, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export function TopBar() {
  const [query, setQuery] = useState('')

  return (
    <header className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search teams, competitions, players…"
          className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Live indicator */}
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-live/10 border border-live/20"
        >
          <Wifi size={11} className="text-live" />
          <span className="text-xs font-medium text-live">LIVE</span>
        </motion.div>

        <button className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors relative">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
