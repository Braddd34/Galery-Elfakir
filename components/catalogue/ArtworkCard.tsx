"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast-context"
import { CompareButton } from "@/components/artwork/CompareDrawer"
import { getArtworkImageUrl } from "@/lib/image-utils"
import { useFavorites } from "@/lib/favorites-context"

interface ArtworkCardProps {
  artwork: {
    id: string
    title: string
    slug: string
    category: string
    year: number
    price: number | string
    width: number | string
    height: number | string
    images: unknown
    artist: {
      user: {
        name: string | null
      }
    }
  }
}

const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjYyNjI2Ii8+PC9zdmc+"

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { favoriteIds, toggle } = useFavorites()
  const isFavorite = favoriteIds.has(artwork.id)
  const [loading, setLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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
      const nowFav = await toggle(artwork.id)
      showToast(
        nowFav ? "Ajouté aux favoris" : "Retiré des favoris",
        nowFav ? "success" : "info"
      )
    } catch {
      showToast("Une erreur est survenue", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative card-hover">
      {/* Compare Button — en haut à gauche */}
      <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <CompareButton artwork={{
          id: artwork.id,
          title: artwork.title,
          slug: artwork.slug,
          price: Number(artwork.price),
          year: artwork.year,
          width: Number(artwork.width),
          height: Number(artwork.height),
          medium: "",
          category: artwork.category,
          image: getArtworkImageUrl(artwork.images),
          artistName: artwork.artist.user.name || "Artiste",
        }} />
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        disabled={loading}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full transition-all duration-300 ${
          isFavorite 
            ? "bg-white text-red-500 scale-100" 
            : "bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
        } hover:scale-110 active:scale-95 disabled:opacity-50`}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${loading ? "animate-pulse" : ""} ${isFavorite ? "fill-current" : "fill-none"}`} 
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
        <div className="relative aspect-[3/4] bg-neutral-900 mb-4 overflow-hidden rounded-sm">
          <Image
            src={getArtworkImageUrl(artwork.images)}
            alt={artwork.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? "blur-0 scale-100" : "blur-md scale-105"
            }`}
            placeholder="blur"
            blurDataURL={blurDataURL}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Quick view hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white/90 text-black px-4 py-2 text-xs tracking-wider uppercase font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Voir l'œuvre
            </span>
          </div>
        </div>
        
        {/* Info */}
        <div className="space-y-1">
          <p className="text-neutral-500 text-sm transition-colors duration-300 group-hover:text-neutral-400">
            {artwork.artist.user.name || "Artiste"}
          </p>
          <h3 className="text-white font-light italic group-hover:text-gold transition-colors duration-300">
            {artwork.title}
          </h3>
          <div className="flex items-center justify-between pt-1">
            <p className="text-neutral-500 text-sm">
              {Number(artwork.width)}×{Number(artwork.height)} cm
            </p>
            <p className="text-white text-lg font-medium">
              {Number(artwork.price).toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}
