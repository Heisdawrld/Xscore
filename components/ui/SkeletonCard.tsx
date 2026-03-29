export function SkeletonCard({ rows=1 }: { rows?:number }) {
  const pulse: React.CSSProperties = {
    background: 'linear-gradient(90deg, #112240 25%, #1a2f4a 50%, #112240 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s linear infinite',
    borderRadius: 8,
  }
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <div style={{ ...pulse, height:10, width:100 }} />
        <div style={{ ...pulse, height:10, width:40 }} />
      </div>
      {Array.from({length:rows}).map((_,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ ...pulse, width:28, height:28, borderRadius:'50%' }} />
            <div style={{ ...pulse, height:10, width:120 }} />
          </div>
          <div style={{ ...pulse, width:20, height:20 }} />
        </div>
      ))}
      <div style={{ ...pulse, height:6, borderRadius:999 }} />
    </div>
  )
}
