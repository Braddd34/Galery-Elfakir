"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface Artist {
  id: string
  name: string
}

export default function ManagerExportPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loadingArtists, setLoadingArtists] = useState(true)
  const [error, setError] = useState("")

  const [artworkArtistFilter, setArtworkArtistFilter] = useState("")
  const [salesArtistFilter, setSalesArtistFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [downloadingArtworks, setDownloadingArtworks] = useState(false)
  const [downloadingSales, setDownloadingSales] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const fetchArtists = useCallback(async () => {
    setLoadingArtists(true)
    setError("")
    try {
      const res = await fetch("/api/manager/artists")
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      setArtists(data.artists || [])
    } catch {
      setError("Impossible de charger la liste des artistes")
    } finally {
      setLoadingArtists(false)
    }
  }, [])

  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const downloadFile = async (type: "artworks" | "sales") => {
    const isArtworks = type === "artworks"
    if (isArtworks) setDownloadingArtworks(true)
    else setDownloadingSales(true)

    try {
      const params = new URLSearchParams({ type })
      const artistId = isArtworks ? artworkArtistFilter : salesArtistFilter
      if (artistId) params.set("artistId", artistId)
      if (!isArtworks && dateFrom) params.set("from", dateFrom)
      if (!isArtworks && dateTo) params.set("to", dateTo)

      const res = await fetch(`/api/manager/export?${params}`)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erreur serveur" }))
        throw new Error(data.error || "Erreur lors du téléchargement")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const disposition = res.headers.get("Content-Disposition") || ""
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
      a.download = filenameMatch?.[1] || `${type}_${new Date().toISOString().split("T")[0]}.csv`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setToast({ type: "success", message: `Export ${isArtworks ? "inventaire" : "ventes"} téléchargé` })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du téléchargement"
      setToast({ type: "error", message })
    } finally {
      if (isArtworks) setDownloadingArtworks(false)
      else setDownloadingSales(false)
    }
  }

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
        <h1 className="text-3xl font-light mb-2">Export de rapports</h1>
        <p className="text-neutral-500 mb-10">Téléchargez vos données au format CSV pour les analyser ou les archiver.</p>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-sm shadow-lg ${
              toast.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Loading skeleton */}
        {loadingArtists && (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 animate-pulse">
                <div className="h-5 bg-neutral-800 rounded w-40 mb-4" />
                <div className="h-3 bg-neutral-800 rounded w-64 mb-6" />
                <div className="h-10 bg-neutral-800 rounded w-full mb-4" />
                <div className="h-12 bg-neutral-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Erreur */}
        {!loadingArtists && error && (
          <div className="text-center py-16 border border-neutral-800 rounded-lg">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchArtists}
              className="px-6 py-2 border border-neutral-700 text-sm hover:border-white transition-colors rounded"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Cartes d'export */}
        {!loadingArtists && !error && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Export Inventaire */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium">Export inventaire</h2>
              </div>
              <p className="text-sm text-neutral-400 mb-6">
                Exportez la liste complète des œuvres avec titre, artiste, catégorie, prix, statut et nombre de vues.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Filtrer par artiste (optionnel)</label>
                  <select
                    value={artworkArtistFilter}
                    onChange={e => setArtworkArtistFilter(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500"
                  >
                    <option value="">Tous les artistes</option>
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => downloadFile("artworks")}
                  disabled={downloadingArtworks}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {downloadingArtworks ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Exporter CSV
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export Ventes */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium">Export ventes</h2>
              </div>
              <p className="text-sm text-neutral-400 mb-6">
                Exportez l&apos;historique des ventes avec numéro de commande, artiste, acheteur, montant et commission.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Filtrer par artiste (optionnel)</label>
                  <select
                    value={salesArtistFilter}
                    onChange={e => setSalesArtistFilter(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500"
                  >
                    <option value="">Tous les artistes</option>
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Date début (optionnel)</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Date fin (optionnel)</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => downloadFile("sales")}
                  disabled={downloadingSales}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {downloadingSales ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Exporter CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
