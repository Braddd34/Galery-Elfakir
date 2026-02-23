"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface TopArtist {
  name: string
  soldCount: number
  revenue: number
}

interface TopArtwork {
  id: string
  title: string
  views: number
  artistName: string
}

interface SalesByMonth {
  month: string
  count: number
  revenue: number
  commission: number
}

interface Stats {
  totalArtists: number
  totalArtworks: number
  availableArtworks: number
  soldArtworks: number
  totalRevenue: number
  totalCommission: number
  totalViews: number
  cartAbandonment: number
  topArtists: TopArtist[]
  topArtworks: TopArtwork[]
  salesByMonth: SalesByMonth[]
}

export default function ManagerStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/manager/stats")
      if (!res.ok) throw new Error("Erreur serveur")
      const data = await res.json()
      setStats(data)
    } catch {
      setError("Impossible de charger les statistiques")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const totalSalesRevenue = stats?.salesByMonth.reduce((sum, m) => sum + m.revenue, 0) || 0
  const totalSalesCount = stats?.salesByMonth.reduce((sum, m) => sum + m.count, 0) || 0
  const conversionRate = totalSalesCount > 0 && stats
    ? ((stats.soldArtworks / Math.max(stats.totalArtworks, 1)) * 100).toFixed(1)
    : "0"

  const maxMonthlyRevenue = stats
    ? Math.max(...stats.salesByMonth.map(m => m.revenue), 1)
    : 1
  const maxArtistRevenue = stats
    ? Math.max(...stats.topArtists.map(a => a.revenue), 1)
    : 1
  const maxArtworkViews = stats
    ? Math.max(...stats.topArtworks.map(a => a.views), 1)
    : 1

  // Entonnoir panier : on estime les ajouts à partir du taux d'abandon
  const estimatedAdds = stats && stats.cartAbandonment > 0
    ? Math.round(totalSalesCount / (1 - stats.cartAbandonment / 100)) || 0
    : totalSalesCount
  const estimatedCheckouts = totalSalesCount

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Statistiques</h1>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg animate-pulse">
                  <div className="h-3 bg-neutral-800 rounded w-24 mb-3" />
                  <div className="h-8 bg-neutral-800 rounded w-20" />
                </div>
              ))}
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg animate-pulse h-64" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg animate-pulse h-48" />
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg animate-pulse h-48" />
            </div>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="text-center py-16 border border-neutral-800 rounded-lg">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="px-6 py-2 border border-neutral-700 text-sm hover:border-white transition-colors rounded"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Contenu */}
        {!loading && !error && stats && (
          <div className="space-y-8">
            {/* Cartes résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Taux de conversion</p>
                <p className="text-3xl font-semibold">{conversionRate}%</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {stats.soldArtworks} vendue{stats.soldArtworks > 1 ? "s" : ""} / {stats.totalArtworks} total
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Taux d&apos;abandon panier</p>
                <p className="text-3xl font-semibold">{stats.cartAbandonment}%</p>
                <p className="text-xs text-neutral-500 mt-2">
                  Sur les 30 derniers jours
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Revenue total</p>
                <p className="text-3xl font-semibold">{totalSalesRevenue.toLocaleString()} €</p>
                <p className="text-xs text-green-500 mt-2">
                  {totalSalesCount} vente{totalSalesCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Commission totale</p>
                <p className="text-3xl font-semibold">{stats.totalCommission.toLocaleString()} €</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {stats.totalArtists} artiste{stats.totalArtists > 1 ? "s" : ""} gérés
                </p>
              </div>
            </div>

            {/* Ventes par mois - Bar Chart */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-6">Ventes par mois</h3>
              {stats.salesByMonth.length > 0 ? (
                <>
                  <div className="h-48 flex items-end gap-4">
                    {stats.salesByMonth.map(m => {
                      const height = (m.revenue / maxMonthlyRevenue) * 100
                      const monthLabel = new Date(m.month + "-01").toLocaleDateString("fr-FR", { month: "short" })
                      return (
                        <div key={m.month} className="flex-1 group relative flex flex-col items-center">
                          <div className="w-full relative" style={{ height: "192px" }}>
                            <div
                              className="absolute bottom-0 w-full bg-green-500/30 hover:bg-green-500/50 transition-colors rounded-t"
                              style={{ height: `${Math.max(height, 3)}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500 mt-2 capitalize">{monthLabel}</p>
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-3 py-2 rounded whitespace-nowrap z-10 border border-neutral-700">
                            <p className="font-medium">{m.revenue.toLocaleString()} €</p>
                            <p className="text-neutral-400">{m.count} vente{m.count > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="text-neutral-500 text-center py-8">Aucune donnée de vente</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Top artistes - Barres horizontales */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-6">Top artistes par revenue</h3>
                {stats.topArtists.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topArtists.map((artist, i) => {
                      const width = (artist.revenue / maxArtistRevenue) * 100
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="truncate mr-2">{artist.name}</span>
                            <span className="text-neutral-400 whitespace-nowrap">{artist.revenue.toLocaleString()} €</span>
                          </div>
                          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white/20 rounded-full transition-all"
                              style={{ width: `${Math.max(width, 2)}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">{artist.soldCount} vente{artist.soldCount > 1 ? "s" : ""}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-center py-6">Aucune donnée</p>
                )}
              </div>

              {/* Top œuvres par vues */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-6">Top œuvres par vues</h3>
                {stats.topArtworks.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topArtworks.map((artwork, i) => {
                      const width = (artwork.views / maxArtworkViews) * 100
                      return (
                        <div key={artwork.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-neutral-500 font-semibold">#{i + 1}</span>
                              <span className="truncate">{artwork.title}</span>
                            </div>
                            <span className="text-neutral-400 whitespace-nowrap ml-2">{artwork.views} vues</span>
                          </div>
                          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500/30 rounded-full transition-all"
                              style={{ width: `${Math.max(width, 2)}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">{artwork.artistName}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-center py-6">Aucune donnée</p>
                )}
              </div>
            </div>

            {/* Entonnoir d'abandon de panier */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-6">Entonnoir panier</h3>
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0">
                {/* Ajouts au panier */}
                <div className="flex-1 w-full">
                  <div className="relative mx-auto" style={{ maxWidth: "100%" }}>
                    <div
                      className="bg-white/10 rounded-lg flex flex-col items-center justify-center py-6 mx-auto"
                      style={{ width: "100%" }}
                    >
                      <p className="text-2xl font-semibold">{estimatedAdds}</p>
                      <p className="text-sm text-neutral-400 mt-1">Ajouts au panier</p>
                    </div>
                  </div>
                </div>

                {/* Flèche */}
                <div className="hidden md:flex items-center px-4">
                  <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="md:hidden">
                  <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Checkouts */}
                <div className="flex-1 w-full">
                  <div
                    className="bg-green-500/10 rounded-lg flex flex-col items-center justify-center py-6 mx-auto"
                    style={{ width: `${Math.max(estimatedAdds > 0 ? (estimatedCheckouts / estimatedAdds) * 100 : 50, 40)}%` }}
                  >
                    <p className="text-2xl font-semibold">{estimatedCheckouts}</p>
                    <p className="text-sm text-neutral-400 mt-1">Checkouts</p>
                  </div>
                </div>

                {/* Flèche */}
                <div className="hidden md:flex items-center px-4">
                  <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="md:hidden">
                  <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Taux */}
                <div className="flex-1 w-full">
                  <div
                    className="bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col items-center justify-center py-6 mx-auto"
                    style={{ width: "60%" }}
                  >
                    <p className="text-2xl font-semibold text-red-400">{stats.cartAbandonment}%</p>
                    <p className="text-sm text-neutral-400 mt-1">Abandon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
