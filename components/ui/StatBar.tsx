'use client'
import { motion } from 'framer-motion'

interface Props {
  label:     string
  homeVal:   number
  awayVal:   number
  homeLabel?: string
  awayLabel?: string
  format?:   (v: number) => string
}

export function StatBar({ label, homeVal, awayVal, homeLabel, awayLabel, format }: Props) {
  const total = homeVal + awayVal || 1
  const homePct = (homeVal / total) * 100
  const awayPct = (awayVal / total) * 100
  const fmt = format ?? ((v: number) => String(v))

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-primary">{fmt(homeVal)}</span>
        <span className="text-text-muted text-[10px] uppercase tracking-wider">{label}</span>
        <span className="font-semibold text-info">{fmt(awayVal)}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${homePct}%` }}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
          className="bg-primary rounded-l-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${awayPct}%` }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22,1,0.36,1] }}
          className="bg-info rounded-r-full"
        />
      </div>
    </div>
  )
}
