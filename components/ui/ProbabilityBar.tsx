'use client'
import { motion } from 'framer-motion'

interface Props { home:number; draw:number; away:number; size?:'sm'|'lg'; showLabels?:boolean }

export function ProbabilityBar({ home, draw, away, size='sm', showLabels=false }: Props) {
  const hp = Math.round(home*100)
  const dp = Math.round(draw*100)
  const ap = Math.round(away*100)
  const h  = hp + dp + ap
  const hn = h ? `${(hp/h*100).toFixed(1)}%` : '33.3%'
  const dn = h ? `${(dp/h*100).toFixed(1)}%` : '33.3%'
  const an = h ? `${(ap/h*100).toFixed(1)}%` : '33.3%'
  const barH = size === 'lg' ? 10 : 6

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {showLabels && (
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600 }}>
          <span style={{ color:'#00ff87' }}>{hp}% Home</span>
          <span style={{ color:'#ffd700' }}>{dp}% Draw</span>
          <span style={{ color:'#00b4d8' }}>{ap}% Away</span>
        </div>
      )}
      <div style={{ display:'flex', height:barH, borderRadius:999, overflow:'hidden', gap:2, background:'#112240' }}>
        <motion.div initial={{width:0}} animate={{width:hn}} transition={{duration:0.8, ease:[0.22,1,0.36,1]}} style={{background:'#00ff87', borderRadius:'999px 0 0 999px'}} />
        <motion.div initial={{width:0}} animate={{width:dn}} transition={{duration:0.8, delay:0.05, ease:[0.22,1,0.36,1]}} style={{background:'#ffd700'}} />
        <motion.div initial={{width:0}} animate={{width:an}} transition={{duration:0.8, delay:0.1, ease:[0.22,1,0.36,1]}} style={{background:'#00b4d8', borderRadius:'0 999px 999px 0'}} />
      </div>
    </div>
  )
}
