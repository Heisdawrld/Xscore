'use client'
import { motion } from 'framer-motion'

interface Props { label:string; homeVal:number; awayVal:number; format?:(v:number)=>string }

export function StatBar({ label, homeVal, awayVal, format }: Props) {
  const total = homeVal + awayVal || 1
  const fmt = format ?? ((v:number) => String(v))
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
        <span style={{ fontWeight:700, color:'#00ff87' }}>{fmt(homeVal)}</span>
        <span style={{ color:'#4a6fa5', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
        <span style={{ fontWeight:700, color:'#00b4d8' }}>{fmt(awayVal)}</span>
      </div>
      <div style={{ height:6, borderRadius:999, overflow:'hidden', background:'#1a2f4a', display:'flex' }}>
        <motion.div initial={{width:0}} animate={{width:`${homeVal/total*100}%`}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}} style={{background:'#00ff87', borderRadius:'999px 0 0 999px'}} />
        <motion.div initial={{width:0}} animate={{width:`${awayVal/total*100}%`}} transition={{duration:0.7,delay:0.05,ease:[0.22,1,0.36,1]}} style={{background:'#00b4d8', borderRadius:'0 999px 999px 0'}} />
      </div>
    </div>
  )
}
