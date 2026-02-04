"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast-context"

interface FavoriteButtonProps {
  artworkId: string
  className?: string
}

export default function FavoriteButton({ artworkId, className = "" }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  // Vérifier si l'œuvre est dans les favoris au chargement
  useEffect(() => {
    if (session) {
      fetch("/api/favorites")
        .then(res => res.json())
        .then(data => {
          if (data.favoriteIds?.includes(artworkId)) {
            setIsFavorite(true)
          }
        })
        .catch(() => {})
    }
  }, [session, artworkId])

  const handleClick = async () => {
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
        body: JSON.stringify({ artworkId })
      })

      if (res.ok) {
        const data = await res.json()
        setIsFavorite(data.isFavorite)
        showToast(
          data.isFavorite ? "Ajouté aux favoris" : "Retiré des favoris",
          data.isFavorite ? "success" : "info"
        )
      }
    } catch (error) {
      showToast("Une erreur est survenue", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`border border-neutral-700 py-5 text-sm tracking-[0.15em] uppercase hover:border-white transition-colors flex items-center justify-center gap-3 disabled:opacity-50 ${className}`}
    >
      <svg 
        className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "fill-none text-white"}`} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      {isFavorite ? "Retirer des favoris" : "Sauvegarder"}
    </button>
  )
}
