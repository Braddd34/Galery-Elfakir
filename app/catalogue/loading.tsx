import Header from "@/components/layout/Header"
import { ArtworkGridSkeleton } from "@/components/ui/Loading"

export default function CatalogueLoading() {
  return (
    <>
      <Header />
      <main className="bg-black text-white min-h-screen pt-28">
        {/* Hero Header Skeleton */}
        <header className="pt-12 pb-20 border-b border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="h-4 w-32 bg-neutral-800 animate-pulse mb-4" />
                <div className="h-16 w-64 bg-neutral-800 animate-pulse" />
              </div>
              <div className="h-16 w-80 bg-neutral-800 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Filters Skeleton */}
        <div className="border-b border-neutral-800 sticky top-[73px] bg-black z-40">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-6">
            <div className="flex gap-4 items-center mb-6">
              <div className="h-14 flex-1 max-w-xl bg-neutral-800 animate-pulse" />
              <div className="h-14 w-32 bg-neutral-800 animate-pulse" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-28 bg-neutral-800 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <section className="py-20">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <ArtworkGridSkeleton count={8} />
          </div>
        </section>
      </main>
    </>
  )
}
