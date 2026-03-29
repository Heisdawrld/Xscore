'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MatchCard } from '@/components/ui/MatchCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { StatBar } from '@/components/ui/StatBar'
import { Users, BarChart2, Calendar } from 'lucide-react'

const TABS = ['Overview','Schedule','Squad'] as const
type Tab = typeof TABS[number]

export default function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const teamId = id.includes('sr:') ? id : `sr:competitor:${id}`
  const [tab, setTab]   = useState<Tab>('Overview')
  const [data, setData] = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/team?id=${encodeURIComponent(teamId)}&tab=${tab}`)
      .then(r=>r.json()).then(d => { setData(d); setLoading(false) })
  }, [id, tab, teamId])

  const profile = (data?.profile as Record<string,unknown>) ?? {}
  const competitor = (profile.competitor as Record<string,unknown>) ?? {}

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:56, height:56, borderRadius:14, background:'#1a2f4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#8bafc7' }}>
          {String(competitor.abbreviation ?? '?').slice(0,3).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:26, fontWeight:800, color:'#e8f4fd' }}>{String(competitor.name ?? 'Team')}</h1>
          <p style={{ fontSize:12, color:'#4a6fa5', marginTop:2 }}>{String(competitor.country ?? '')}</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, padding:4, background:'#0d1b2a', borderRadius:12, width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 16px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', border:'none',
            background: tab===t ? 'rgba(0,255,135,0.12)' : 'transparent',
            color:      tab===t ? '#00ff87' : '#8bafc7',
            outline:    tab===t ? '1px solid rgba(0,255,135,0.25)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      {loading ? <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>{Array.from({length:4}).map((_,i)=><SkeletonCard key={i} rows={2}/>)}</div> : (
        <>
          {tab==='Schedule' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
              {((data?.matches as unknown[]) ?? []).map((m:unknown,i:number) => {
                const match = m as {matchId:string;homeTeam:{id:string;name:string;abbreviation:string};awayTeam:{id:string;name:string;abbreviation:string};homeScore?:number;awayScore?:number;status:string;scheduled:string;competition:string}
                return <MatchCard key={match.matchId} {...match} index={i}/>
              })}
            </div>
          )}
          {tab==='Squad' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:8 }}>
              {((data?.players as unknown[]) ?? []).map((p:unknown,i:number) => {
                const pl = p as {id:string;name:string;position?:string;date_of_birth?:string;nationality?:string;jersey_number?:number}
                return (
                  <div key={pl.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px', display:'flex', gap:12, alignItems:'center' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:'#1a2f4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#4a6fa5', flexShrink:0 }}>{pl.jersey_number ?? i+1}</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'#e8f4fd' }}>{pl.name}</p>
                      <p style={{ fontSize:11, color:'#4a6fa5', marginTop:2, textTransform:'uppercase', letterSpacing:'0.04em' }}>{pl.position ?? 'N/A'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {tab==='Overview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:'#8bafc7', display:'flex', alignItems:'center', gap:8 }}><BarChart2 size={14}/> Recent Form</h3>
                {((data?.stats as Record<string,unknown>)?.totals as Record<string,unknown>) ? (
                  <p style={{color:'#4a6fa5',fontSize:13}}>Statistics loaded</p>
                ) : <p style={{color:'#4a6fa5',fontSize:13}}>No stats available for current season.</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
