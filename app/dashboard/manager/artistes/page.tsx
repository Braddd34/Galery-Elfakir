"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"

interface Artist {
  id: string
  userId: string
  name: string
  image: string | null
  artworkCount: number
  soldCount: number
  availableCount: number
  revenue: number
  totalViews: number
  lastArtworkDate: string | null
}

export default function ManagerArtistesPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/manager/artists")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur")
        return res.json()
      })
      .then((data) => setArtists(data.artists || []))
      .catch(() => setError("Impossible de charger les artistes"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return artists
    const q = search.toLowerCase()
    return artists.filter((a) => a.name?.toLowerCase().includes(q))
  }, [artists, search])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light">Mes artistes</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {artists.length} artiste{artists.length > 1 ? "s" : ""} sous votre gestion
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un artiste…"
          className="w-full sm:w-72 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500">
            {search ? "Aucun artiste trouvé pour cette recherche" : "Aucun artiste assigné"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((artist) => (
            <div
              key={artist.id}
              className="bg-neutral-900 border border-neutral-800 rounded overflow-hidden hover:border-neutral-700 transition-colors"
            >
              <div className="p-5">
                {/* Artist identity */}
                <div className="flex items-center gap-3 mb-4">
                  {artist.image ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      width={44}
                      height={44}
                      className="rounded-full object-cover w-11 h-11"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm font-medium">
                      {artist.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{artist.name}</p>
                    <p className="text-xs text-neutral-500">
                      {artist.artworkCount} œuvre{artist.artworkCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-neutral-500">Vendues</p>
                    <p className="text-sm font-medium text-green-400">{artist.soldCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Disponibles</p>
                    <p className="text-sm font-medium">{artist.availableCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Revenu total</p>
                    <p className="text-sm font-medium">{artist.revenue.toLocaleString("fr-FR")} €</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Vues</p>
                    <p className="text-sm font-medium">{artist.totalViews}</p>
                  </div>
                </div>

                {/* Link */}
                <Link
                  href={`/dashboard/manager/artistes/${artist.id}`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Voir détails →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 bg-neutral-800 rounded w-40 mb-2" />
          <div className="h-4 bg-neutral-800 rounded w-60" />
        </div>
        <div className="h-10 bg-neutral-800 rounded w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-neutral-800" />
              <div className="flex-1">
                <div className="h-4 bg-neutral-800 rounded w-28 mb-1" />
                <div className="h-3 bg-neutral-800 rounded w-16" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-3 bg-neutral-800 rounded w-16 mb-1" />
                  <div className="h-4 bg-neutral-800 rounded w-10" />
                </div>
              ))}
            </div>
            <div className="h-4 bg-neutral-800 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
