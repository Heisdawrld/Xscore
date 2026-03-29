'use client'
import { motion } from 'framer-motion'

export function LiveBadge({ minute }: { minute?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-live/15 border border-live/30">
      <motion.span
        className="relative flex h-2 w-2"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
      </motion.span>
      <span className="text-[10px] font-bold tracking-widest text-live">
        {minute ? `${minute}'` : 'LIVE'}
      </span>
    </span>
  )
}
