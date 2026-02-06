export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-32">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse mb-2" />
          <div className="h-10 w-64 bg-neutral-800 rounded animate-pulse" />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-neutral-900/50 p-6 border border-neutral-800">
              <div className="h-3 w-20 bg-neutral-800 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-neutral-800 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-neutral-900 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-6">
            <div className="h-6 w-40 bg-neutral-800 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-neutral-800">
                  <div className="w-16 h-16 bg-neutral-800 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-neutral-900 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-6">
            <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-neutral-800/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
