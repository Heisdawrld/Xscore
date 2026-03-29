export function SkeletonCard({ rows = 1 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="skeleton h-3 w-12 rounded-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded-full" />
            <div className="skeleton h-3 w-32 rounded-full" />
          </div>
          <div className="skeleton h-5 w-5 rounded" />
        </div>
      ))}
      <div className="skeleton h-1.5 rounded-full" />
    </div>
  )
}
