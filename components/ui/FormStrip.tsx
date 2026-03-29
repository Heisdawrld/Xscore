const C: Record<string,string> = { W:'#00ff87', D:'#ffd700', L:'#ff4545' }
export function FormStrip({ results, size='sm' }: { results:string[]; size?:'sm'|'md' }) {
  const s = size==='sm' ? 6 : 10
  return (
    <div style={{ display:'flex', gap:3, alignItems:'center' }}>
      {results.slice(0,5).map((r,i) => (
        <span key={i} title={r} style={{ width:s, height:s, borderRadius:'50%', background:C[r]||'#1a2f4a', display:'block', flexShrink:0 }} />
      ))}
    </div>
  )
}
