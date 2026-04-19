export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <article className="max-w-3xl mx-auto px-6">
        <div className="h-8 w-3/4 bg-neutral-800 rounded animate-pulse mb-4" />
        <div className="h-4 w-48 bg-neutral-800/60 rounded animate-pulse mb-8" />
        <div className="aspect-[16/9] bg-neutral-800 animate-pulse rounded mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-800/40 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </article>
    </div>
  )
}
