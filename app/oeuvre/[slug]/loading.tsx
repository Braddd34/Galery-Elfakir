export default function OeuvreLoading() {
  return (
    <div className="bg-black text-white min-h-screen pt-32">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-neutral-800/50">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
            <span className="text-neutral-700">/</span>
            <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse" />
            <span className="text-neutral-700">/</span>
            <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Left: Image skeleton */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[4/5] bg-neutral-900 animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-square bg-neutral-900 animate-pulse" />
                <div className="aspect-square bg-neutral-900 animate-pulse" />
                <div className="aspect-square bg-neutral-900 animate-pulse" />
              </div>
            </div>

            {/* Right: Info skeleton */}
            <div className="lg:col-span-5 space-y-10">
              {/* Header */}
              <div>
                <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse mb-4" />
                <div className="h-10 w-3/4 bg-neutral-800 rounded animate-pulse mb-2" />
                <div className="h-5 w-1/2 bg-neutral-900 rounded animate-pulse" />
              </div>

              {/* Artist */}
              <div className="flex items-center gap-5 py-6 border-y border-neutral-800">
                <div className="w-16 h-16 bg-neutral-900 animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-neutral-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-neutral-900 rounded animate-pulse" />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
                  <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-neutral-900 rounded animate-pulse" />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="py-4 border-b border-neutral-800">
                      <div className="h-3 w-20 bg-neutral-900 rounded animate-pulse mb-2" />
                      <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-neutral-900/50 p-8 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="h-3 w-10 bg-neutral-800 rounded animate-pulse mb-2" />
                    <div className="h-10 w-32 bg-neutral-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-14 w-full bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
