'use client'
import { motion } from 'framer-motion'

export function LiveBadge({ minute }: { minute?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 8px', borderRadius:999, background:'rgba(255,69,69,0.12)', border:'1px solid rgba(255,69,69,0.3)' }}>
      <div style={{ position:'relative', width:7, height:7 }}>
        <motion.div
          animate={{ scale:[1,2,1], opacity:[1,0,1] }}
          transition={{ repeat:Infinity, duration:1.4, ease:'easeInOut' }}
          style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#ff4545', opacity:0.5 }}
        />
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#ff4545' }} />
      </div>
      <span style={{ fontSize:10, fontWeight:700, color:'#ff4545', letterSpacing:'0.08em' }}>
        {minute ? `${minute}'` : 'LIVE'}
      </span>
    </div>
  )
}
