'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function PlayersPage() {
  const [q, setQ] = useState('')
  const router = useRouter()

  return (
    <div style={{ maxWidth:800, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:28, fontWeight:800, color:'#e8f4fd' }}>Players</h1>
        <p style={{ color:'#4a6fa5', fontSize:13, marginTop:4 }}>Search any player by name to view their profile and stats</p>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4a6fa5' }}/>
          <input value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && q) router.push(`/api/player-search?q=${q}`) }}
            placeholder="Search players... (press Enter)"
            style={{ width:'100%', background:'#112240', border:'1px solid #1e3a5f', borderRadius:12, padding:'12px 14px 12px 36px', fontSize:14, color:'#e8f4fd', outline:'none' }}/>
        </div>
      </div>
      <p style={{ color:'#4a6fa5', fontSize:12, textAlign:'center' }}>Player search coming in next update. Access players via team squad pages.</p>
    </div>
  )
}
