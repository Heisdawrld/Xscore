'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MatchCard }    from '@/components/ui/MatchCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { RefreshCw }    from 'lucide-react'

type Match = {
  matchId:string; homeTeam:{id:string;name:string;abbreviation:string}; awayTeam:{id:string;name:string;abbreviation:string}
  homeScore?:number; awayScore?:number; status:string; minute?:number; scheduled:string; competition:string
}

const SECTION = (color: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
})

export default function HomePage() {
  const [live, setLive]       = useState<Match[]>([])
  const [today, setToday]     = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<Date|null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [lr, dr] = await Promise.all([
        fetch('/api/matches/live').then(r=>r.json()),
        fetch('/api/matches/daily').then(r=>r.json()),
      ])
      setLive(lr.matches ?? [])
      setToday(dr.matches ?? [])
      setUpdated(new Date())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll(); const id = setInterval(fetchAll, 30000); return () => clearInterval(id) }, [fetchAll])

  const scheduled = today.filter(m => m.status === 'not_started')
  const finished  = today.filter(m => ['closed','ended','complete'].includes(m.status))

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Page title */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:30, fontWeight:800, color:'#e8f4fd', lineHeight:1.1 }}>
            Match Centre
          </h1>
          <p style={{ fontSize:13, color:'#4a6fa5', marginTop:4 }}>
            {updated ? `Updated ${updated.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}` : 'Loading data…'}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAll() }}
          style={{ padding:10, borderRadius:12, background:'#112240', border:'1px solid #1e3a5f', color:'#8bafc7', cursor:'pointer', display:'flex', alignItems:'center' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* LIVE */}
      {(loading || live.length > 0) && (
        <section>
          <div style={SECTION('#ff4545')}>
            <motion.div animate={{opacity:[1,0.4,1]}} transition={{repeat:Infinity,duration:1.5}}
              style={{width:8,height:8,borderRadius:'50%',background:'#ff4545'}} />
            <span style={{fontFamily:'var(--font-syne,Syne,sans-serif)',fontSize:18,fontWeight:700,color:'#e8f4fd'}}>Live Now</span>
            {!loading && <span style={{fontSize:13,color:'#ff4545',fontWeight:600}}>({live.length})</span>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {loading ? Array.from({length:3}).map((_,i)=><SkeletonCard key={i} rows={2}/>) : live.map((m,i)=><MatchCard key={m.matchId} {...m} index={i}/>)}
          </div>
        </section>
      )}

      {/* Today scheduled */}
      {(loading || scheduled.length > 0) && (
        <section>
          <div style={SECTION('#ffd700')}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#ffd700'}} />
            <span style={{fontFamily:'var(--font-syne,Syne,sans-serif)',fontSize:18,fontWeight:700,color:'#e8f4fd'}}>Today</span>
            {!loading && <span style={{fontSize:13,color:'#ffd700',fontWeight:600}}>({scheduled.length})</span>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {loading ? Array.from({length:6}).map((_,i)=><SkeletonCard key={i} rows={2}/>) : scheduled.map((m,i)=><MatchCard key={m.matchId} {...m} index={i}/>)}
          </div>
        </section>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <section>
          <div style={SECTION('#4a6fa5')}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#4a6fa5'}} />
            <span style={{fontFamily:'var(--font-syne,Syne,sans-serif)',fontSize:18,fontWeight:700,color:'#e8f4fd'}}>Results</span>
            <span style={{fontSize:13,color:'#4a6fa5',fontWeight:600}}>({finished.length})</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {finished.map((m,i)=><MatchCard key={m.matchId} {...m} index={i}/>)}
          </div>
        </section>
      )}

      {!loading && live.length===0 && scheduled.length===0 && finished.length===0 && (
        <div style={{textAlign:'center',padding:'80px 24px',background:'rgba(255,255,255,0.02)',borderRadius:20,border:'1px solid rgba(255,255,255,0.06)'}}>
          <p style={{fontSize:16,color:'#4a6fa5'}}>No matches today.</p>
        </div>
      )}
    </div>
  )
}
