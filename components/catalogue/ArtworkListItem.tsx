"use client"

import Link from "next/link"
import Image from "next/image"
import FavoriteButton from "@/components/ui/FavoriteButton"

interface ArtworkListItemProps {
  artwork: {
    id: string
    title: string
    slug: string
    price: number
    year: number
    width: number
    height: number
    depth?: number | null
    medium: string
    category: string
    views: number
    images: string
    artist: {
      user: {
        name: string | null
      }
    }
  }
}

// Mapping des catégories
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

export default function ArtworkListItem({ artwork }: ArtworkListItemProps) {
  // Parse les images
  const getImageUrl = () => {
    try {
      const images = typeof artwork.images === 'string' 
        ? JSON.parse(artwork.images) 
        : artwork.images
      return images?.[0]?.url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
    } catch {
      return "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
    }
  }
  
  const formatDimensions = () => {
    let dims = `${artwork.width} × ${artwork.height}`
    if (artwork.depth) dims += ` × ${artwork.depth}`
    return dims + " cm"
  }
  
  return (
    <div className="flex gap-6 p-4 bg-neutral-900/50 rounded-lg hover:bg-neutral-900 transition-colors group">
      {/* Image */}
      <Link href={`/oeuvre/${artwork.slug}`} className="relative w-40 h-40 flex-shrink-0">
        <Image
          src={getImageUrl()}
          alt={artwork.title}
          fill
          className="object-cover rounded"
          sizes="160px"
        />
      </Link>
      
      {/* Infos */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link 
                href={`/oeuvre/${artwork.slug}`}
                className="text-lg font-medium hover:underline"
              >
                {artwork.title}
              </Link>
              <p className="text-neutral-400">
                {artwork.artist.user.name || "Artiste inconnu"}
              </p>
            </div>
            <FavoriteButton artworkId={artwork.id} />
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-neutral-400">
            <span>{categoryLabels[artwork.category] || artwork.category}</span>
            <span>{artwork.year}</span>
            <span>{formatDimensions()}</span>
            <span>{artwork.medium}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <span className="text-xl font-semibold">
              {artwork.price.toLocaleString("fr-FR")} €
            </span>
            <span className="text-sm text-neutral-500">
              {artwork.views} vue{artwork.views > 1 ? "s" : ""}
            </span>
          </div>
          
          <Link
            href={`/oeuvre/${artwork.slug}`}
            className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors opacity-0 group-hover:opacity-100"
          >
            Voir l'œuvre
          </Link>
        </div>
      </div>
    </div>
  )
}
