'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell } from 'lucide-react'

export function TopBar() {
  const [q, setQ] = useState('')

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      height: 56,
      borderBottom: '1px solid #1e3a5f',
      background: 'rgba(13,27,42,0.85)',
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a6fa5' }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search teams, leagues, players…"
          style={{
            width: '100%',
            background: '#112240',
            border: '1px solid #1e3a5f',
            borderRadius: 12,
            padding: '8px 14px 8px 34px',
            fontSize: 13,
            color: '#e8f4fd',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* LIVE badge */}
        <motion.div
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(255,69,69,0.12)',
            border: '1px solid rgba(255,69,69,0.25)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ff4545', display: 'block' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#ff4545', letterSpacing: '0.1em' }}>LIVE</span>
        </motion.div>

        {/* Bell */}
        <button style={{
          padding: 8,
          borderRadius: 10,
          background: 'transparent',
          border: '1px solid #1e3a5f',
          color: '#8bafc7',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
