'use client'
import { useEffect, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

type Transfer = { player:{name:string}; type:string; start_date:string; from_competitor?:{name:string}; to_competitor?:{name:string} }

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading]     = useState(false)

  return (
    <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#00b4d8,#0077ff)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ArrowRightLeft size={20} color="#fff"/>
        </div>
        <div>
          <h1 style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:28, fontWeight:800, color:'#e8f4fd' }}>Transfers</h1>
          <p style={{ color:'#4a6fa5', fontSize:13, marginTop:2 }}>Season transfer window tracker</p>
        </div>
      </div>

      <div style={{ background:'rgba(0,180,216,0.05)', border:'1px solid rgba(0,180,216,0.2)', borderRadius:16, padding:'20px 24px' }}>
        <p style={{ color:'#00b4d8', fontSize:14, fontWeight:500 }}>Browse a competition and select Season Transfers from the competition page to see transfers for that league.</p>
      </div>

      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'48px 24px', textAlign:'center' }}>
        <ArrowRightLeft size={32} color="#1e3a5f" style={{ margin:'0 auto 12px' }}/>
        <p style={{ color:'#4a6fa5', fontSize:14 }}>Go to any Competition page → view season transfers</p>
      </div>
    </div>
  )
}
