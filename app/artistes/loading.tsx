import Header from "@/components/layout/Header"

export default function ArtistesLoading() {
  return (
    <>
      <Header />
      <main className="bg-black text-white min-h-screen pt-28">
        {/* Hero skeleton */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-12 bg-neutral-800 rounded w-64 mb-4 animate-pulse" />
            <div className="h-6 bg-neutral-800 rounded w-96 animate-pulse" />
          </div>
        </section>

        {/* Grid skeleton */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group">
                  {/* Image principale skeleton */}
                  <div className="aspect-[4/3] bg-neutral-800 mb-4 animate-pulse rounded" />
                  
                  {/* Mini galerie skeleton */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div 
                        key={j} 
                        className="aspect-square bg-neutral-800 animate-pulse rounded"
                        style={{ animationDelay: `${j * 100}ms` }}
                      />
                    ))}
                  </div>
                  
                  {/* Info skeleton */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-800 rounded w-32 mb-2 animate-pulse" />
                      <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
