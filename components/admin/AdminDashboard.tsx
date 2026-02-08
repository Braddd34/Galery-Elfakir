"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface AdminStats {
  stats: {
    totalUsers: number
    totalArtists: number
    totalBuyers: number
    totalArtworks: number
    availableArtworks: number
    soldArtworks: number
    totalOrders: number
    totalRevenue: number
    newUsersThisMonth: number
    newArtworksThisMonth: number
  }
  charts: {
    registrationsByMonth: Record<string, number>
    revenueByMonth: Record<string, number>
    viewsByDay: Record<string, number>
    months: string[]
  }
  alerts: {
    type: string
    message: string
    count: number
    link: string
  }[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-neutral-900 p-6 rounded-lg h-24" />
          ))}
        </div>
        <div className="h-48 bg-neutral-900 rounded-lg" />
      </div>
    )
  }
  
  if (!data) return null
  
  const { stats, charts, alerts } = data
  
  // Graphique vues 30 jours
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split("T")[0]
  })
  const maxViews = Math.max(...last30Days.map(d => charts.viewsByDay[d] || 0), 1)
  
  // Graphique revenus
  const maxRevenue = Math.max(...charts.months.map(m => charts.revenueByMonth[m] || 0), 1)
  
  // Graphique inscriptions
  const maxRegistrations = Math.max(...charts.months.map(m => charts.registrationsByMonth[m] || 0), 1)
  
  return (
    <div className="space-y-8">
      {/* Alertes urgentes */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <Link
              key={i}
              href={alert.link}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                alert.type === "urgent"
                  ? "bg-red-500/10 border-red-500/30 hover:border-red-500"
                  : alert.type === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500"
                    : "bg-blue-500/10 border-blue-500/30 hover:border-blue-500"
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.type === "urgent" ? (
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )}
                <span className="text-sm">{alert.message}</span>
              </div>
              <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
      
      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <p className="text-3xl font-light">{stats.totalUsers}</p>
          <p className="text-neutral-500 text-sm mt-1">Utilisateurs</p>
          <p className="text-xs text-green-500 mt-2">+{stats.newUsersThisMonth} ce mois</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <p className="text-3xl font-light">{stats.totalArtworks}</p>
          <p className="text-neutral-500 text-sm mt-1">Œuvres</p>
          <p className="text-xs text-green-500 mt-2">+{stats.newArtworksThisMonth} ce mois</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <p className="text-3xl font-light">{stats.totalOrders}</p>
          <p className="text-neutral-500 text-sm mt-1">Commandes</p>
          <p className="text-xs text-neutral-400 mt-2">{stats.soldArtworks} vendues</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <p className="text-3xl font-light">€{stats.totalRevenue.toLocaleString("fr-FR")}</p>
          <p className="text-neutral-500 text-sm mt-1">Revenus</p>
        </div>
      </div>
      
      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vues 30 jours */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Vues du site (30 jours)</h3>
          <div className="h-32 flex items-end gap-px">
            {last30Days.map((day) => {
              const views = charts.viewsByDay[day] || 0
              const height = (views / maxViews) * 100
              return (
                <div key={day} className="flex-1 group relative">
                  <div
                    className="w-full bg-blue-500/30 hover:bg-blue-500/50 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {new Date(day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}: {views}
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
        
        {/* Revenus 6 mois */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Revenus (6 mois)</h3>
          <div className="h-32 flex items-end gap-4">
            {charts.months.map((month) => {
              const revenue = charts.revenueByMonth[month] || 0
              const height = (revenue / maxRevenue) * 100
              const label = new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short" })
              return (
                <div key={month} className="flex-1 group relative">
                  <div
                    className="w-full bg-green-500/30 hover:bg-green-500/50 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <p className="text-center text-xs text-neutral-500 mt-2 capitalize">{label}</p>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {revenue.toFixed(0)} €
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Inscriptions 6 mois */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Inscriptions (6 mois)</h3>
          <div className="h-32 flex items-end gap-4">
            {charts.months.map((month) => {
              const count = charts.registrationsByMonth[month] || 0
              const height = (count / maxRegistrations) * 100
              const label = new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short" })
              return (
                <div key={month} className="flex-1 group relative">
                  <div
                    className="w-full bg-purple-500/30 hover:bg-purple-500/50 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <p className="text-center text-xs text-neutral-500 mt-2 capitalize">{label}</p>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {count} inscriptions
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Répartition */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Répartition</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Acheteurs</span>
                <span>{stats.totalBuyers}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.totalBuyers / stats.totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Artistes</span>
                <span>{stats.totalArtists}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.totalArtists / stats.totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-800">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Œuvres disponibles</span>
                <span>{stats.availableArtworks}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${stats.totalArtworks > 0 ? (stats.availableArtworks / stats.totalArtworks) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Œuvres vendues</span>
                <span>{stats.soldArtworks}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${stats.totalArtworks > 0 ? (stats.soldArtworks / stats.totalArtworks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
