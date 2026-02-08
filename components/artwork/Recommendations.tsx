"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface RecommendedArtwork {
  id: string
  title: string
  slug: string
  price: number
  category: string
  year: number
  imageUrl: string
  artistName: string
  artistId: string
}

/**
 * Composant "Vous aimerez aussi" — affiche des recommandations personnalisées.
 * Si l'utilisateur est connecté avec des favoris, les recommandations sont basées 
 * sur ses goûts (catégories, artistes, prix similaires).
 * Sinon, affiche les œuvres les plus populaires.
 */
export default function Recommendations({ 
  artworkId, 
  limit = 4 
}: { 
  artworkId?: string
  limit?: number 
}) {
  const [artworks, setArtworks] = useState<RecommendedArtwork[]>([])
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams()
        if (artworkId) params.set("artworkId", artworkId)
        params.set("limit", limit.toString())

        const res = await fetch(`/api/recommendations?${params}`)
        if (res.ok) {
          const data = await res.json()
          setArtworks(data.recommendations || [])
          setIsPersonalized(data.isPersonalized || false)
        }
      } catch (error) {
        console.error("Erreur chargement recommandations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [artworkId, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-neutral-800 mb-4" />
            <div className="h-4 bg-neutral-800 w-3/4 mb-2" />
            <div className="h-3 bg-neutral-800 w-1/2 mb-2" />
            <div className="h-4 bg-neutral-800 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (artworks.length === 0) return null

  return (
    <div>
      <div className="flex justify-between items-end mb-16">
        <div>
          <p className="label text-gold mb-4">
            {isPersonalized ? "Pour vous" : "Explorer"}
          </p>
          <h2 className="heading-sm">
            {isPersonalized ? "Vous aimerez aussi" : "Œuvres populaires"}
          </h2>
          {isPersonalized && (
            <p className="text-neutral-500 text-sm mt-2">
              Basé sur vos favoris et vos goûts
            </p>
          )}
        </div>
        <Link
          href="/catalogue"
          className="text-sm tracking-[0.15em] uppercase text-neutral-500 hover:text-white transition-colors"
        >
          Voir tout
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {artworks.map((artwork) => (
          <Link key={artwork.id} href={`/oeuvre/${artwork.slug}`} className="group">
            <div className="img-zoom aspect-[3/4] bg-neutral-900 mb-4">
              {artwork.imageUrl ? (
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-700">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="font-light group-hover:text-gold transition-colors">
              {artwork.title}
            </h3>
            <p className="text-neutral-500 text-sm">{artwork.artistName}</p>
            <p className="mt-1">€{artwork.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
