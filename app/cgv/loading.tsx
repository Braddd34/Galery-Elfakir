export default function CGVLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-10 w-64 bg-neutral-800 rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-800/40 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
