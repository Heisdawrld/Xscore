interface Props { results: string[]; size?: 'sm' | 'md' }

const COLOR: Record<string, string> = {
  W: 'bg-win',
  D: 'bg-draw',
  L: 'bg-loss',
}

export function FormStrip({ results, size = 'sm' }: Props) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'
  return (
    <div className="flex gap-0.5 items-center">
      {results.slice(0, 5).map((r, i) => (
        <span key={i} className={`${dotSize} rounded-full ${COLOR[r] ?? 'bg-surface-3'}`} title={r} />
      ))}
    </div>
  )
}
