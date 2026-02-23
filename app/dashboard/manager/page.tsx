"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Stats {
  totalArtists: number
  totalArtworks: number
  availableArtworks: number
  soldArtworks: number
  totalRevenue: number
  totalCommission: number
  totalViews: number
  cartAbandonment: number
  topArtists: { name: string; soldCount: number; revenue: number }[]
  topArtworks: { id: string; title: string; views: number; artistName: string }[]
  recentSales: {
    id: string
    orderNumber: string
    artworkTitle: string
    artistName: string
    buyerName: string
    total: number
    commission: number
    artistPayout: number
    status: string
    date: string
  }[]
  stagnantArtworks: { id: string; title: string; artistName: string }[]
  salesByMonth: { month: string; count: number; revenue: number; commission: number }[]
}

export default function ManagerOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/manager/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur")
        return res.json()
      })
      .then((data) => setStats(data))
      .catch(() => setError("Impossible de charger les statistiques"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || "Données non disponibles"}</p>
      </div>
    )
  }

  const maxMonthRevenue = Math.max(...stats.salesByMonth.map((m) => m.revenue), 1)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light">Tableau de bord gestionnaire</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Suivez les performances de vos artistes et leurs œuvres
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Artistes gérés" value={stats.totalArtists} />
        <StatCard
          label="Ventes totales"
          value={`${stats.totalRevenue.toLocaleString("fr-FR")} €`}
          accent="text-green-400"
        />
        <StatCard
          label="Commissions"
          value={`${stats.totalCommission.toLocaleString("fr-FR")} €`}
          accent="text-purple-400"
        />
        <StatCard label="Œuvres actives" value={stats.availableArtworks} />
      </div>

      {/* Alerts */}
      {(stats.recentSales.length > 0 || stats.stagnantArtworks.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-lg font-light">Alertes</h2>

          {stats.recentSales.length > 0 && (
            <div className="space-y-2">
              {stats.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-4 py-3 rounded"
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate">
                      <span className="text-green-400 font-medium">Vente</span>{" "}
                      — {sale.artworkTitle} par {sale.artistName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Acheteur : {sale.buyerName} · {new Date(sale.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="text-green-400 text-sm font-medium shrink-0 ml-4">
                    {sale.total.toLocaleString("fr-FR")} €
                  </span>
                </div>
              ))}
            </div>
          )}

          {stats.stagnantArtworks.length > 0 && (
            <div className="space-y-2">
              {stats.stagnantArtworks.slice(0, 5).map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded"
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate">
                      <span className="text-orange-400 font-medium">Stagnante</span>{" "}
                      — {art.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Artiste : {art.artistName} · Aucune vue depuis 30 jours
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Two columns: top artists + top artworks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 artists */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-6">
          <h3 className="text-sm font-medium text-neutral-400 mb-4">Top 5 artistes par ventes</h3>
          {stats.topArtists.length > 0 ? (
            <div className="space-y-3">
              {stats.topArtists.map((artist, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg font-semibold text-neutral-600 w-6 text-right">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{artist.name}</p>
                      <p className="text-xs text-neutral-500">{artist.soldCount} vendue{artist.soldCount > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-400 shrink-0">
                    {artist.revenue.toLocaleString("fr-FR")} €
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm text-center py-4">Aucune vente</p>
          )}
        </div>

        {/* Top 5 artworks by views */}
        <div className="bg-neutral-900 border border-neutral-800 rounded p-6">
          <h3 className="text-sm font-medium text-neutral-400 mb-4">Top 5 œuvres par vues</h3>
          {stats.topArtworks.length > 0 ? (
            <div className="space-y-3">
              {stats.topArtworks.map((art, i) => (
                <div key={art.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg font-semibold text-neutral-600 w-6 text-right">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{art.title}</p>
                      <p className="text-xs text-neutral-500">{art.artistName}</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-400 shrink-0">{art.views} vues</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm text-center py-4">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Sales by month chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded p-6">
        <h3 className="text-sm font-medium text-neutral-400 mb-6">Ventes par mois</h3>
        <div className="h-48 flex items-end gap-4">
          {stats.salesByMonth.map((m) => {
            const height = (m.revenue / maxMonthRevenue) * 100
            const label = new Date(m.month + "-01").toLocaleDateString("fr-FR", { month: "short" })
            return (
              <div key={m.month} className="flex-1 group relative">
                <div
                  className="w-full bg-white/15 hover:bg-white/30 transition-colors rounded-t"
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
                <p className="text-center text-xs text-neutral-500 mt-2 capitalize">{label}</p>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {m.revenue.toLocaleString("fr-FR")} € · {m.count} vente{m.count > 1 ? "s" : ""}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
      <p className={`text-2xl font-light ${accent || ""}`}>{value}</p>
      <p className="text-neutral-500 text-xs mt-1">{label}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div>
        <div className="h-7 bg-neutral-800 rounded w-72 mb-2" />
        <div className="h-4 bg-neutral-800 rounded w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded p-5">
            <div className="h-7 bg-neutral-800 rounded w-20 mb-2" />
            <div className="h-3 bg-neutral-800 rounded w-24" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded p-6">
            <div className="h-4 bg-neutral-800 rounded w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-5 bg-neutral-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded p-6">
        <div className="h-4 bg-neutral-800 rounded w-32 mb-6" />
        <div className="h-48 flex items-end gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-1 bg-neutral-800 rounded-t" style={{ height: `${20 + i * 10}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
