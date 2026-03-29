'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users } from 'lucide-react'

export default function TeamsPage() {
  const [q, setQ] = useState('')
  const router = useRouter()

  const POPULAR = [
    { id:'sr:competitor:17', name:'Manchester United', abbr:'MUN', league:'Premier League' },
    { id:'sr:competitor:18', name:'Arsenal',           abbr:'ARS', league:'Premier League' },
    { id:'sr:competitor:38', name:'Real Madrid',       abbr:'RMA', league:'La Liga' },
    { id:'sr:competitor:35', name:'Barcelona',         abbr:'BAR', league:'La Liga' },
    { id:'sr:competitor:40', name:'Bayern Munich',     abbr:'BAY', league:'Bundesliga' },
    { id:'sr:competitor:29', name:'Juventus',          abbr:'JUV', league:'Serie A' },
    { id:'sr:competitor:32', name:'PSG',               abbr:'PSG', league:'Ligue 1' },
    { id:'sr:competitor:44', name:'Manchester City',   abbr:'MCI', league:'Premier League' },
    { id:'sr:competitor:50', name:'Liverpool',         abbr:'LIV', league:'Premier League' },
    { id:'sr:competitor:52', name:'Chelsea',           abbr:'CHE', league:'Premier League' },
    { id:'sr:competitor:42', name:'Atletico Madrid',   abbr:'ATM', league:'La Liga' },
    { id:'sr:competitor:80', name:'Borussia Dortmund', abbr:'BVB', league:'Bundesliga' },
  ]

  const filtered = POPULAR.filter(t => !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.league.toLowerCase().includes(q.toLowerCase()))

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:28, fontWeight:800, color:'#e8f4fd' }}>Teams</h1>
        <p style={{ color:'#4a6fa5', fontSize:13, marginTop:4 }}>Search any team by name or browse popular clubs</p>
      </div>

      <div style={{ position:'relative', maxWidth:400 }}>
        <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4a6fa5' }}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search teams..."
          style={{ width:'100%', background:'#112240', border:'1px solid #1e3a5f', borderRadius:12, padding:'10px 14px 10px 34px', fontSize:13, color:'#e8f4fd', outline:'none' }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
        {filtered.map(t => (
          <button key={t.id} onClick={() => router.push(`/teams/${t.id.replace('sr:competitor:','')}`)} style={{
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:14, padding:'16px', cursor:'pointer', textAlign:'left',
            display:'flex', flexDirection:'column', gap:10, transition:'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border='1px solid rgba(0,255,135,0.2)'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border='1px solid rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}
          >
            <div style={{ width:44, height:44, borderRadius:12, background:'#1a2f4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#8bafc7' }}>{t.abbr}</div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'#e8f4fd' }}>{t.name}</p>
              <p style={{ fontSize:11, color:'#4a6fa5', marginTop:2 }}>{t.league}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
