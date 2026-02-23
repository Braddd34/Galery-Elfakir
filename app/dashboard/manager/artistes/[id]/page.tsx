"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface Artist {
  id: string
  name: string
  image: string | null
  artworkCount: number
  soldCount: number
  availableCount: number
  revenue: number
  totalViews: number
}

interface Artwork {
  id: string
  title: string
  slug: string
  category: string
  price: number
  status: string
  views: number
  images: string
  artistName: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  artworkTitle: string
  buyerName: string
  total: number
  status: string
  date: string
}

export default function ManagerArtistDetailPage() {
  const params = useParams()
  const artistId = params.id as string

  const [artist, setArtist] = useState<Artist | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!artistId) return

    const fetchData = async () => {
      try {
        const [artistRes, artworksRes, statsRes] = await Promise.all([
          fetch("/api/manager/artists"),
          fetch(`/api/manager/artworks?artistId=${artistId}`),
          fetch("/api/manager/stats"),
        ])

        if (!artistRes.ok || !artworksRes.ok) throw new Error("Erreur")

        const artistData = await artistRes.json()
        const artworksData = await artworksRes.json()

        const found = artistData.artists?.find((a: Artist) => a.id === artistId)
        if (!found) {
          setError("Artiste non trouvé")
          return
        }

        setArtist(found)
        setArtworks(artworksData.artworks || [])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          const orders = (statsData.recentSales || [])
            .filter((s: any) => {
              const artworkIds = (artworksData.artworks || []).map((a: Artwork) => a.id)
              return artworkIds.length > 0
            })
            .slice(0, 5)
            .map((s: any) => ({
              id: s.id,
              orderNumber: s.orderNumber,
              artworkTitle: s.artworkTitle,
              buyerName: s.buyerName,
              total: s.total,
              status: s.status,
              date: s.date,
            }))
          setRecentOrders(orders)
        }
      } catch {
        setError("Impossible de charger les données de l'artiste")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [artistId])

  if (loading) return <LoadingSkeleton />

  if (error || !artist) {
    return (
      <div className="text-center py-20">
        <Link href="/dashboard/manager/artistes" className="text-neutral-400 hover:text-white text-sm transition-colors">
          ← Mes artistes
        </Link>
        <p className="text-red-500 mt-6">{error || "Artiste non trouvé"}</p>
      </div>
    )
  }

  const statusLabel: Record<string, { text: string; color: string }> = {
    AVAILABLE: { text: "Disponible", color: "text-green-400" },
    SOLD: { text: "Vendu", color: "text-purple-400" },
    PENDING: { text: "En attente", color: "text-yellow-400" },
    DRAFT: { text: "Brouillon", color: "text-neutral-400" },
    ARCHIVED: { text: "Archivé", color: "text-neutral-500" },
  }

  return (
    <div className="space-y-10">
      {/* Back link */}
      <Link
        href="/dashboard/manager/artistes"
        className="inline-block text-neutral-400 hover:text-white text-sm transition-colors"
      >
        ← Mes artistes
      </Link>

      {/* Artist header */}
      <div className="flex items-center gap-5">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-xl font-medium">
            {artist.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-light">{artist.name}</h1>
          <p className="text-sm text-neutral-500">
            {artist.artworkCount} œuvre{artist.artworkCount > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
          <p className="text-2xl font-light">{artist.artworkCount}</p>
          <p className="text-neutral-500 text-xs mt-1">Total œuvres</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
          <p className="text-2xl font-light text-green-400">{artist.soldCount}</p>
          <p className="text-neutral-500 text-xs mt-1">Vendues</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
          <p className="text-2xl font-light">{artist.revenue.toLocaleString("fr-FR")} €</p>
          <p className="text-neutral-500 text-xs mt-1">Revenu</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
          <p className="text-2xl font-light">{artist.totalViews}</p>
          <p className="text-neutral-500 text-xs mt-1">Vues totales</p>
        </div>
      </div>

      {/* Artworks table */}
      <div>
        <h2 className="text-lg font-light mb-4">Œuvres</h2>

        {artworks.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded p-8 text-center">
            <p className="text-neutral-500">Aucune œuvre pour cet artiste</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-left">
                  <th className="px-4 py-3 font-medium">Œuvre</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Prix</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Vues</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((artwork) => {
                  const thumb = getFirstImage(artwork.images)
                  const st = statusLabel[artwork.status] || { text: artwork.status, color: "text-neutral-400" }

                  return (
                    <tr key={artwork.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={artwork.title}
                              width={40}
                              height={40}
                              className="rounded object-cover w-10 h-10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-neutral-800 rounded shrink-0" />
                          )}
                          <span className="truncate max-w-[180px]">{artwork.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-neutral-400 capitalize">
                        {artwork.category?.toLowerCase()}
                      </td>
                      <td className="px-4 py-3">{Number(artwork.price).toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3">
                        <span className={st.color}>{st.text}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-neutral-400">{artwork.views}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/manager/oeuvres?edit=${artwork.id}`}
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          Modifier
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-light mb-4">Commandes récentes</h2>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 rounded px-4 py-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm truncate">{order.artworkTitle}</p>
                  <p className="text-xs text-neutral-500">
                    {order.buyerName} · {new Date(order.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className="text-sm text-green-400 shrink-0 ml-4">
                  {order.total.toLocaleString("fr-FR")} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getFirstImage(imagesJson: string): string | null {
  try {
    const images = JSON.parse(imagesJson)
    if (Array.isArray(images) && images.length > 0) {
      return images[0].url || null
    }
  } catch {
    // noop
  }
  return null
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-4 bg-neutral-800 rounded w-28" />
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-neutral-800" />
        <div>
          <div className="h-7 bg-neutral-800 rounded w-44 mb-2" />
          <div className="h-4 bg-neutral-800 rounded w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded p-5">
            <div className="h-7 bg-neutral-800 rounded w-16 mb-2" />
            <div className="h-3 bg-neutral-800 rounded w-20" />
          </div>
        ))}
      </div>
      <div>
        <div className="h-5 bg-neutral-800 rounded w-20 mb-4" />
        <div className="bg-neutral-900 border border-neutral-800 rounded p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
