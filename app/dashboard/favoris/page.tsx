"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/lib/toast-context"

interface FavoriteArtwork {
  id: string
  artworkId: string
  artwork: {
    id: string
    title: string
    slug: string
    price: number
    images: any
    artist: {
      user: {
        name: string | null
      }
    }
  }
}

function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}

export default function MesFavorisPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteArtwork[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Rediriger si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Charger les favoris
  useEffect(() => {
    if (session) {
      fetchFavorites()
    }
  }, [session])

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites/list")
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error("Erreur chargement favoris:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (artworkId: string) => {
    setRemovingId(artworkId)
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId })
      })

      if (res.ok) {
        // Retirer immédiatement de la liste locale
        setFavorites(prev => prev.filter(f => f.artwork.id !== artworkId))
        showToast("Retiré des favoris", "info")
      } else {
        showToast("Erreur lors de la suppression", "error")
      }
    } catch {
      showToast("Erreur lors de la suppression", "error")
    } finally {
      setRemovingId(null)
    }
  }

  // Composant de partage wishlist
  function ShareWishlistButton({ userId }: { userId: string }) {
    const [copied, setCopied] = useState(false)
    
    const handleShare = async () => {
      const url = `${window.location.origin}/wishlist/${userId}`
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        showToast("Lien copié !", "success")
        setTimeout(() => setCopied(false), 2000)
      } catch {
        showToast("Erreur de copie", "error")
      }
    }
    
    return (
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 border border-neutral-700 hover:border-white rounded-lg transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {copied ? "Lien copié !" : "Partager ma sélection"}
      </button>
    )
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-neutral-500">Chargement...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light">Mes favoris</h1>
          <div className="flex items-center gap-4">
            <p className="text-neutral-500">
              {favorites.length} œuvre{favorites.length > 1 ? 's' : ''}
            </p>
            {session?.user?.id && favorites.length > 0 && (
              <ShareWishlistButton userId={session.user.id} />
            )}
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((fav) => (
              <div key={fav.id} className="group relative">
                {/* Bouton supprimer */}
                <button
                  onClick={() => removeFavorite(fav.artwork.id)}
                  disabled={removingId === fav.artwork.id}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-110 disabled:opacity-50"
                  title="Retirer des favoris"
                >
                  {removingId === fav.artwork.id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>

                <Link href={`/oeuvre/${fav.artwork.slug}`}>
                  <div className="aspect-[3/4] bg-neutral-900 mb-4 overflow-hidden">
                    <img
                      src={getImageUrl(fav.artwork.images)}
                      alt={fav.artwork.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-light italic group-hover:text-gold transition-colors">
                    {fav.artwork.title}
                  </h3>
                  <p className="text-neutral-500 text-sm">{fav.artwork.artist.user.name}</p>
                  <p className="mt-1">{Number(fav.artwork.price).toLocaleString('fr-FR')} €</p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-neutral-800">
            <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-neutral-500 mb-4">Vous n'avez pas encore de favoris</p>
            <Link href="/catalogue" className="text-white underline hover:text-neutral-300">
              Découvrir le catalogue
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
