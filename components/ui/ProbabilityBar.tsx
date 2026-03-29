'use client'
import { motion } from 'framer-motion'

interface Props {
  home: number
  draw: number
  away: number
  size?: 'sm' | 'lg'
  showLabels?: boolean
}

export function ProbabilityBar({ home, draw, away, size = 'sm', showLabels = false }: Props) {
  const hp = Math.round(home * 100)
  const dp = Math.round(draw * 100)
  const ap = Math.round(away * 100)
  const h  = `${hp}%`, d = `${dp}%`, a = `${ap}%`

  return (
    <div className="space-y-1.5">
      {showLabels && (
        <div className="flex justify-between text-[10px] text-text-muted">
          <span className="font-medium text-primary">{h} Home</span>
          <span>{d} Draw</span>
          <span className="font-medium text-[#00b4d8]">{a} Away</span>
        </div>
      )}
      <div className={`flex rounded-full overflow-hidden gap-px ${ size === 'lg' ? 'h-2.5' : 'h-1.5' }`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: h }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-primary rounded-l-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: d }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gold"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: a }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-info rounded-r-full"
        />
      </div>
    </div>
  )
}
