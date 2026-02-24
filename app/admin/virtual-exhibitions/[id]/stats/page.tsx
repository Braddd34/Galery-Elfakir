"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface StatsData {
  totalVisits: number
  uniqueVisitors: number
  avgDuration: number
  totalArtworkClicks: number
  topArtworks: { id: string; title: string; clickCount: number }[]
  deviceBreakdown: { desktop: number; mobile: number; tablet: number }
  visitsByDay: { date: string; count: number }[]
  conversionFunnel: {
    visits: number
    artworkClicks: number
    cartAdds: number
    sales: number
  }
}

const PERIODS = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "all", label: "Tout" },
] as const

export default function VirtualExhibitionStatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>("30d")
  const [exhibitionTitle, setExhibitionTitle] = useState("")

  const fetchStats = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await fetch(
        `/api/virtual-exhibitions/${id}/analytics/stats?period=${period}`
      )
      if (!res.ok) throw new Error("Erreur chargement")
      const stats = await res.json()
      setData(stats)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [id, period])

  const fetchExhibition = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/virtual-exhibitions/${id}`)
      if (res.ok) {
        const ex = await res.json()
        setExhibitionTitle(ex.title || "")
      }
    } catch {
      //
    }
  }, [id])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
      router.push("/dashboard")
      return
    }
    fetchExhibition()
    fetchStats()
  }, [session, status, router, fetchExhibition, fetchStats])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/virtual-exhibitions"
          className="inline-flex items-center gap-2 text-amber-500 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  const d = data!
  const clickRate =
    d.totalVisits > 0
      ? Math.round((d.conversionFunnel.artworkClicks / d.totalVisits) * 100)
      : 0
  const conversionRate =
    d.totalVisits > 0
      ? Math.round((d.conversionFunnel.sales / d.totalVisits) * 100)
      : 0
  const maxVisits = Math.max(
    1,
    ...d.visitsByDay.map((v) => v.count)
  )
  const totalDevices =
    d.deviceBreakdown.desktop +
    d.deviceBreakdown.mobile +
    d.deviceBreakdown.tablet
  const maxClicks = Math.max(
    1,
    ...d.topArtworks.map((a) => a.clickCount)
  )
  const funnelMax = Math.max(
    1,
    d.conversionFunnel.visits,
    d.conversionFunnel.artworkClicks,
    d.conversionFunnel.cartAdds,
    d.conversionFunnel.sales
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/virtual-exhibitions"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-white">
              Statistiques
              {exhibitionTitle && (
                <span className="text-neutral-500 font-normal ml-2">
                  — {exhibitionTitle}
                </span>
              )}
            </h1>
            <p className="text-neutral-500 mt-1">Tableau de bord analytique</p>
          </div>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm transition-colors ${
                period === p.value
                  ? "bg-amber-600 text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <p className="text-3xl font-light text-white">{d.totalVisits}</p>
          <p className="text-neutral-500 text-sm mt-1">Visites totales</p>
        </div>
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <p className="text-3xl font-light text-amber-500">
            {Math.floor(d.avgDuration / 60)} min
          </p>
          <p className="text-neutral-500 text-sm mt-1">Durée moyenne</p>
        </div>
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <p className="text-3xl font-light text-amber-500">{clickRate}%</p>
          <p className="text-neutral-500 text-sm mt-1">Taux de clics</p>
        </div>
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <p className="text-3xl font-light text-amber-500">{conversionRate}%</p>
          <p className="text-neutral-500 text-sm mt-1">Taux de conversion</p>
        </div>
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <p className="text-3xl font-light text-white">
            {d.conversionFunnel.sales}
          </p>
          <p className="text-neutral-500 text-sm mt-1">Ventes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <h2 className="text-lg font-light text-white mb-6">
            Visites dans le temps
          </h2>
          <div className="flex items-end gap-1 h-48">
            {d.visitsByDay.length === 0 ? (
              <p className="text-neutral-500 text-sm">Aucune donnée</p>
            ) : (
              d.visitsByDay.map((v) => (
                <div
                  key={v.date}
                  className="flex-1 min-w-[4px] bg-amber-600/80 hover:bg-amber-500 transition-colors"
                  style={{
                    height: `${Math.max(4, (v.count / maxVisits) * 100)}%`,
                  }}
                  title={`${v.date}: ${v.count} visites`}
                />
              ))
            )}
          </div>
          {d.visitsByDay.length > 0 && (
            <div className="flex gap-1 mt-2 overflow-x-auto">
              {d.visitsByDay.map((v) => (
                <span
                  key={v.date}
                  className="text-[10px] text-neutral-500 whitespace-nowrap"
                >
                  {new Date(v.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-neutral-800 p-6">
          <h2 className="text-lg font-light text-white mb-6">
            Répartition par appareil
          </h2>
          {totalDevices === 0 ? (
            <p className="text-neutral-500 text-sm">Aucune donnée</p>
          ) : (
            <div
              className="w-40 h-40 rounded-full mx-auto"
              style={{
                background: `conic-gradient(
                  #d97706 0deg ${(d.deviceBreakdown.desktop / totalDevices) * 360}deg,
                  #f59e0b ${(d.deviceBreakdown.desktop / totalDevices) * 360}deg ${((d.deviceBreakdown.desktop + d.deviceBreakdown.mobile) / totalDevices) * 360}deg,
                  #fbbf24 ${((d.deviceBreakdown.desktop + d.deviceBreakdown.mobile) / totalDevices) * 360}deg 360deg
                )`,
              }}
            />
          )}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-600 rounded-full" />
              <span className="text-neutral-400 text-sm">
                Desktop ({d.deviceBreakdown.desktop})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-neutral-400 text-sm">
                Mobile ({d.deviceBreakdown.mobile})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <span className="text-neutral-400 text-sm">
                Tablette ({d.deviceBreakdown.tablet})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-neutral-800 p-6">
          <h2 className="text-lg font-light text-white mb-6">
            Œuvres les plus cliquées
          </h2>
          <div className="space-y-3">
            {d.topArtworks.length === 0 ? (
              <p className="text-neutral-500 text-sm">Aucune donnée</p>
            ) : (
              d.topArtworks.slice(0, 8).map((a) => (
                <div key={a.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white truncate max-w-[70%]">
                      {a.title}
                    </span>
                    <span className="text-neutral-500">{a.clickCount}</span>
                  </div>
                  <div className="h-2 bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 transition-all"
                      style={{
                        width: `${(a.clickCount / maxClicks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-neutral-800 p-6">
          <h2 className="text-lg font-light text-white mb-6">
            Entonnoir de conversion
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Visites</span>
                <span className="text-white">{d.conversionFunnel.visits}</span>
              </div>
              <div className="h-6 bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-600"
                  style={{
                    width: `${(d.conversionFunnel.visits / funnelMax) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Clics œuvres</span>
                <span className="text-white">
                  {d.conversionFunnel.artworkClicks}
                </span>
              </div>
              <div className="h-6 bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500/90"
                  style={{
                    width: `${
                      (d.conversionFunnel.artworkClicks / funnelMax) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Ajouts panier</span>
                <span className="text-white">{d.conversionFunnel.cartAdds}</span>
              </div>
              <div className="h-6 bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500/70"
                  style={{
                    width: `${
                      (d.conversionFunnel.cartAdds / funnelMax) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Ventes</span>
                <span className="text-white">{d.conversionFunnel.sales}</span>
              </div>
              <div className="h-6 bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500/50"
                  style={{
                    width: `${
                      (d.conversionFunnel.sales / funnelMax) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
