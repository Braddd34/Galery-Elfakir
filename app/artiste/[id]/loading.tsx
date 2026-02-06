export default function ArtisteLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-32">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
            <span className="text-neutral-700">/</span>
            <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse" />
            <span className="text-neutral-700">/</span>
            <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Photo skeleton */}
            <div className="lg:col-span-1">
              <div className="aspect-square bg-neutral-900 animate-pulse" />
            </div>

            {/* Info skeleton */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse mb-4" />
              <div className="h-12 w-3/4 bg-neutral-800 rounded animate-pulse mb-4" />
              <div className="h-5 w-40 bg-neutral-900 rounded animate-pulse mb-6" />
              
              <div className="space-y-2 mb-8">
                <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
                <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-neutral-900 rounded animate-pulse" />
              </div>

              <div className="flex items-center gap-8 pt-6 border-t border-neutral-800">
                <div>
                  <div className="h-8 w-12 bg-neutral-800 rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-neutral-900 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks skeleton */}
      <section className="border-t border-neutral-800 py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse mb-12" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-neutral-900 animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-900 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
