"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast-context"

interface ArtworkCardProps {
  artwork: {
    id: string
    title: string
    slug: string
    category: string
    year: number
    price: any
    width: any
    height: any
    images: any
    artist: {
      user: {
        name: string | null
      }
    }
  }
}

const categoryLabels: Record<string, string> = {
  PAINTING: "Peinture",
  SCULPTURE: "Sculpture",
  PHOTOGRAPHY: "Photographie",
  DRAWING: "Dessin",
  PRINT: "Estampe",
  DIGITAL: "Art numérique",
  MIXED_MEDIA: "Technique mixte",
  OTHER: "Autre"
}

function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  // Vérifier si l'œuvre est dans les favoris
  useEffect(() => {
    if (session) {
      fetch("/api/favorites")
        .then(res => res.json())
        .then(data => {
          if (data.favoriteIds?.includes(artwork.id)) {
            setIsFavorite(true)
          }
        })
        .catch(() => {})
    }
  }, [session, artwork.id])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session) {
      showToast("Connectez-vous pour sauvegarder des œuvres", "info")
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId: artwork.id })
      })

      const data = await res.json()
      
      if (res.ok) {
        setIsFavorite(data.isFavorite)
        showToast(
          data.isFavorite ? "Ajouté aux favoris" : "Retiré des favoris",
          data.isFavorite ? "success" : "info"
        )
      } else {
        console.error("Erreur favoris:", data.error)
        showToast(data.error || "Une erreur est survenue", "error")
      }
    } catch (error) {
      console.error("Erreur favoris:", error)
      showToast("Une erreur est survenue", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative">
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        disabled={loading}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all ${
          isFavorite 
            ? "bg-white text-red-500" 
            : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
        } hover:scale-110 disabled:opacity-50`}
      >
        <svg 
          className={`w-5 h-5 ${isFavorite ? "fill-current" : "fill-none"}`} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>

      <Link href={`/oeuvre/${artwork.slug}`}>
        {/* Image */}
        <div className="relative aspect-[3/4] bg-neutral-900 mb-4 overflow-hidden">
          <img
            src={getImageUrl(artwork.images)}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
        </div>
        
        {/* Info */}
        <div className="space-y-1">
          <p className="text-neutral-500 text-sm">
            {artwork.artist.user.name || "Artiste"}
          </p>
          <h3 className="text-white font-light italic group-hover:text-gold transition-colors">
            {artwork.title}
          </h3>
          <p className="text-neutral-500 text-sm">
            {Number(artwork.width)}×{Number(artwork.height)} cm
          </p>
          <p className="text-white text-lg pt-1">
            {Number(artwork.price).toLocaleString('fr-FR')} €
          </p>
        </div>
      </Link>
    </div>
  )
}
