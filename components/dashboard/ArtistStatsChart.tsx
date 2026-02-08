"use client"

import { useState, useEffect } from "react"

interface Stats {
  totalArtworks: number
  availableArtworks: number
  soldArtworks: number
  totalViews: number
  viewsLast30Days: number
  viewsByDay: Record<string, number>
  totalSales: number
  totalRevenue: number
  salesByMonth: Record<string, { count: number; revenue: number }>
  followersCount: number
  newFollowersThisMonth: number
  topArtworksByViews: { id: string; title: string; views: number }[]
  conversionRate: string
}

export default function ArtistStatsChart() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/artist/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        setError("Erreur de chargement")
      }
    } catch (err) {
      setError("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }
  
  const handleExport = async (type: "sales" | "artworks") => {
    window.location.href = `/api/artist/export?type=${type}`
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-neutral-900 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-neutral-800 rounded w-20 mb-2" />
              <div className="h-8 bg-neutral-800 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || "Données non disponibles"}</p>
      </div>
    )
  }
  
  // Générer les 30 derniers jours pour le graphique
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })
  
  const maxViews = Math.max(...last30Days.map(d => stats.viewsByDay[d] || 0), 1)
  
  // Générer les 6 derniers mois pour le graphique des ventes
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    return date.toISOString().substring(0, 7)
  })
  
  const maxRevenue = Math.max(...last6Months.map(m => stats.salesByMonth[m]?.revenue || 0), 1)
  
  return (
    <div className="space-y-8">
      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 p-4 rounded-lg">
          <p className="text-sm text-neutral-400 mb-1">Œuvres</p>
          <p className="text-2xl font-semibold">{stats.totalArtworks}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {stats.availableArtworks} disponibles
          </p>
        </div>
        
        <div className="bg-neutral-900 p-4 rounded-lg">
          <p className="text-sm text-neutral-400 mb-1">Ventes</p>
          <p className="text-2xl font-semibold">{stats.soldArtworks}</p>
          <p className="text-xs text-green-500 mt-1">
            {stats.totalRevenue.toFixed(0)} € gagnés
          </p>
        </div>
        
        <div className="bg-neutral-900 p-4 rounded-lg">
          <p className="text-sm text-neutral-400 mb-1">Vues (30j)</p>
          <p className="text-2xl font-semibold">{stats.viewsLast30Days}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {stats.totalViews} total
          </p>
        </div>
        
        <div className="bg-neutral-900 p-4 rounded-lg">
          <p className="text-sm text-neutral-400 mb-1">Abonnés</p>
          <p className="text-2xl font-semibold">{stats.followersCount}</p>
          <p className="text-xs text-green-500 mt-1">
            +{stats.newFollowersThisMonth} ce mois
          </p>
        </div>
      </div>
      
      {/* Graphique des vues (30 jours) */}
      <div className="bg-neutral-900 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Vues des 30 derniers jours</h3>
        <div className="h-40 flex items-end gap-1">
          {last30Days.map((day, i) => {
            const views = stats.viewsByDay[day] || 0
            const height = (views / maxViews) * 100
            return (
              <div
                key={day}
                className="flex-1 group relative"
              >
                <div
                  className="w-full bg-white/20 hover:bg-white/40 transition-colors rounded-t"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {new Date(day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}: {views} vues
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <span>{new Date(last30Days[0]).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
          <span>Aujourd'hui</span>
        </div>
      </div>
      
      {/* Graphique des revenus (6 mois) */}
      <div className="bg-neutral-900 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Revenus des 6 derniers mois</h3>
        <div className="h-40 flex items-end gap-4">
          {last6Months.map((month) => {
            const data = stats.salesByMonth[month] || { count: 0, revenue: 0 }
            const height = (data.revenue / maxRevenue) * 100
            const monthLabel = new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short" })
            return (
              <div key={month} className="flex-1 group relative">
                <div
                  className="w-full bg-green-500/30 hover:bg-green-500/50 transition-colors rounded-t"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <p className="text-center text-xs text-neutral-500 mt-2 capitalize">{monthLabel}</p>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {data.revenue.toFixed(0)} € ({data.count} ventes)
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Top œuvres + Export */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top œuvres par vues */}
        <div className="bg-neutral-900 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Top œuvres (vues)</h3>
          {stats.topArtworksByViews.length > 0 ? (
            <div className="space-y-3">
              {stats.topArtworksByViews.map((artwork, i) => (
                <div key={artwork.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-neutral-500">#{i + 1}</span>
                    <span className="truncate">{artwork.title}</span>
                  </div>
                  <span className="text-neutral-400">{artwork.views} vues</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">Aucune donnée</p>
          )}
        </div>
        
        {/* Export */}
        <div className="bg-neutral-900 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Exporter mes données</h3>
          <p className="text-sm text-neutral-400 mb-4">
            Téléchargez vos données au format CSV pour les analyser ou les archiver.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleExport("sales")}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export des ventes
              </span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={() => handleExport("artworks")}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Export des œuvres
              </span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            Taux de conversion : {stats.conversionRate}%
          </p>
        </div>
      </div>
    </div>
  )
}
