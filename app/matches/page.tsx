'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MatchCard }    from '@/components/ui/MatchCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

type Match = {
  matchId:string; homeTeam:{id:string;name:string;abbreviation:string}; awayTeam:{id:string;name:string;abbreviation:string}
  homeScore?:number; awayScore?:number; status:string; scheduled:string; competition:string; competitionId:string
}

function dateStr(d: Date) { return d.toISOString().slice(0,10) }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r }

const TAB_FILTER: Record<string, (m: Match) => boolean> = {
  All:       ()  => true,
  Live:      (m) => ['live','inprogress','1st_half','2nd_half','halftime'].includes(m.status),
  Upcoming:  (m) => m.status === 'not_started',
  Finished:  (m) => ['closed','ended','complete'].includes(m.status),
}

export default function MatchesPage() {
  const [date, setDate]       = useState(new Date())
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('All')
  const [search, setSearch]   = useState('')

  const load = useCallback(async (d: Date) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/matches/daily?date=${dateStr(d)}`).then(r=>r.json())
      setMatches(r.matches ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(date) }, [date, load])

  const filtered = matches
    .filter(TAB_FILTER[tab])
    .filter(m => !search || m.homeTeam?.name?.toLowerCase().includes(search.toLowerCase()) || m.awayTeam?.name?.toLowerCase().includes(search.toLowerCase()) || m.competition?.toLowerCase().includes(search.toLowerCase()))

  // Group by competition
  const grouped = filtered.reduce<Record<string, Match[]>>((acc, m) => {
    const k = m.competition || 'Other'
    ;(acc[k] ??= []).push(m)
    return acc
  }, {})

  const isToday = dateStr(date) === dateStr(new Date())

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:28, fontWeight:800, color:'#e8f4fd' }}>Matches</h1>

        {/* Date nav */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => setDate(d => addDays(d,-1))} style={btnStyle}><ChevronLeft size={16}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:12, background:'#112240', border:'1px solid #1e3a5f' }}>
            <Calendar size={14} style={{color:'#4a6fa5'}}/>
            <span style={{ fontSize:13, fontWeight:600, color:'#e8f4fd' }}>
              {isToday ? 'Today' : date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
            </span>
          </div>
          <button onClick={() => setDate(d => addDays(d,1))}  style={btnStyle}><ChevronRight size={16}/></button>
          {!isToday && <button onClick={() => setDate(new Date())} style={{...btnStyle, fontSize:11, padding:'6px 12px', color:'#00ff87', borderColor:'rgba(0,255,135,0.3)'}}>Today</button>}
        </div>
      </div>

      {/* Tabs + Search */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:4, padding:4, background:'#0d1b2a', borderRadius:12 }}>
          {Object.keys(TAB_FILTER).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', border:'none',
              background: tab===t ? 'rgba(0,255,135,0.12)' : 'transparent',
              color:      tab===t ? '#00ff87' : '#8bafc7',
              outline:    tab===t ? '1px solid rgba(0,255,135,0.25)' : 'none',
              transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter teams, leagues…"
          style={{ marginLeft:'auto', background:'#112240', border:'1px solid #1e3a5f', borderRadius:10, padding:'7px 14px', fontSize:13, color:'#e8f4fd', outline:'none', width:220 }}/>
      </div>

      {/* Matches */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
          {Array.from({length:9}).map((_,i) => <SkeletonCard key={i} rows={2}/>)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Empty msg={search ? 'No matches found for your search.' : `No ${tab.toLowerCase()} matches on this date.`} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
          {Object.entries(grouped).map(([comp, ms]) => (
            <section key={comp}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:12, fontWeight:600, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em' }}>{comp}</span>
                <span style={{ fontSize:11, color:'#1e3a5f' }}>({ms.length})</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
                {ms.map((m,i) => <MatchCard key={m.matchId} {...m} index={i}/>)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding:8, borderRadius:10, background:'#112240', border:'1px solid #1e3a5f',
  color:'#8bafc7', cursor:'pointer', display:'flex', alignItems:'center',
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ textAlign:'center', padding:'64px 24px', background:'rgba(255,255,255,0.02)', borderRadius:20, border:'1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ color:'#4a6fa5', fontSize:15 }}>{msg}</p>
    </div>
  )
}
