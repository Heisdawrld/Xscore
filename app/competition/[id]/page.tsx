'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MatchCard } from '@/components/ui/MatchCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Trophy, TrendingUp, Users } from 'lucide-react'

const TABS = ['Schedule','Standings','Leaders'] as const
type Tab = typeof TABS[number]

export default function CompetitionPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id.includes('sr:') ? id : `sr:competition:${id}`

  const [tab, setTab]     = useState<Tab>('Schedule')
  const [data, setData]   = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName]   = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/competition?id=${encodeURIComponent(competitionId)}&tab=${tab}`)
      .then(r=>r.json()).then(d => { setData(d); setName(d.name ?? ''); setLoading(false) })
  }, [id, tab, competitionId])

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#ffd700,#ff9500)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Trophy size={22} color="#0a0f1e"/>
        </div>
        <div>
          <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:26, fontWeight:800, color:'#e8f4fd' }}>
            {name || 'Competition'}
          </h1>
          <p style={{ fontSize:12, color:'#4a6fa5' }}>{competitionId}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, padding:4, background:'#0d1b2a', borderRadius:12, width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', border:'none',
            background: tab===t ? 'rgba(0,255,135,0.12)' : 'transparent',
            color:      tab===t ? '#00ff87' : '#8bafc7',
            outline:    tab===t ? '1px solid rgba(0,255,135,0.25)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {Array.from({length:6}).map((_,i) => <SkeletonCard key={i} rows={2}/>)}
          </div>
        ) : tab === 'Schedule' ? (
          <ScheduleTab matches={(data?.matches as unknown[]) ?? []} />
        ) : tab === 'Standings' ? (
          <StandingsTab standings={(data?.standings as unknown[]) ?? []} />
        ) : (
          <LeadersTab leaders={(data?.leaders as unknown[]) ?? []} />
        )}
      </motion.div>
    </div>
  )
}

function ScheduleTab({ matches }: { matches: unknown[] }) {
  if (!matches.length) return <Empty msg="No fixtures found for this competition." />
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
      {(matches as Array<{
        matchId:string;homeTeam:{id:string;name:string;abbreviation:string};
        awayTeam:{id:string;name:string;abbreviation:string};
        homeScore?:number;awayScore?:number;status:string;scheduled:string;competition:string
      }>).map((m,i) => <MatchCard key={m.matchId} {...m} index={i}/>)}
    </div>
  )
}

function StandingsTab({ standings }: { standings: unknown[] }) {
  if (!standings.length) return <Empty msg="No standings data available." />
  const rows = standings as Array<{rank:number;competitor:{name:string};played:number;win:number;draw:number;loss:number;goals_diff:number;points:number;form?:string}>
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
            {['#','Team','P','W','D','L','GD','Pts'].map(h => (
              <th key={h} style={{ padding:'12px 10px', color:'#4a6fa5', fontWeight:600, textAlign: h==='Team' ? 'left' : 'center', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <td style={{ padding:'11px 10px', textAlign:'center', color:'#4a6fa5', fontWeight:700 }}>{r.rank}</td>
              <td style={{ padding:'11px 10px', color:'#e8f4fd', fontWeight:600 }}>{r.competitor?.name}</td>
              <td style={{ padding:'11px 10px', textAlign:'center', color:'#8bafc7' }}>{r.played}</td>
              <td style={{ padding:'11px 10px', textAlign:'center', color:'#00ff87' }}>{r.win}</td>
              <td style={{ padding:'11px 10px', textAlign:'center', color:'#ffd700' }}>{r.draw}</td>
              <td style={{ padding:'11px 10px', textAlign:'center', color:'#ff4545' }}>{r.loss}</td>
              <td style={{ padding:'11px 10px', textAlign:'center', color: r.goals_diff>0?'#00ff87':r.goals_diff<0?'#ff4545':'#8bafc7', fontWeight:600 }}>{r.goals_diff>0?'+':''}{r.goals_diff}</td>
              <td style={{ padding:'11px 10px', textAlign:'center', color:'#e8f4fd', fontWeight:800, fontSize:14 }}>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LeadersTab({ leaders }: { leaders: unknown[] }) {
  if (!leaders.length) return <Empty msg="No leaders data available." />
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {(leaders as Array<{name:string;competitors:Array<{players:Array<{rank:number;player:{name:string};value:number}>}>}>).map((cat, ci) => (
        <div key={ci} style={{ background:'rgba(255,255,255,0.02)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e3a5f', display:'flex', alignItems:'center', gap:8 }}>
            <TrendingUp size={14} color="#00ff87"/>
            <span style={{ fontSize:13, fontWeight:700, color:'#e8f4fd', textTransform:'capitalize' }}>{cat.name?.replace(/_/g,' ')}</span>
          </div>
          <div>
            {cat.competitors?.flatMap(c=>c.players??[]).slice(0,10).map((p:{rank:number;player:{name:string};value:number}, i:number) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', gap:12 }}>
                <span style={{ width:24, fontSize:12, fontWeight:700, color:'#4a6fa5', textAlign:'center' }}>{p.rank}</span>
                <span style={{ flex:1, fontSize:13, color:'#e8f4fd', fontWeight:500 }}>{p.player?.name}</span>
                <span style={{ fontSize:15, fontWeight:800, color:'#00ff87' }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Empty({ msg }: { msg:string }) {
  return <div style={{ textAlign:'center', padding:'48px', color:'#4a6fa5', fontSize:14 }}>{msg}</div>
}
