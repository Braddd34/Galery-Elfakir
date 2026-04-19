export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-12 w-48 bg-neutral-800 rounded animate-pulse mb-4" />
        <div className="h-6 w-96 bg-neutral-800/60 rounded animate-pulse mb-6" />
        <div className="h-px bg-neutral-800 mb-16" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-neutral-800">
              <div className="aspect-[16/10] bg-neutral-800 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
                <div className="h-5 w-full bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-neutral-800/60 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
