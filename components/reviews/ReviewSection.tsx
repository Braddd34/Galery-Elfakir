"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  verified: boolean
  createdAt: string
  user: {
    name: string | null
    image: string | null
  }
}

interface ReviewStats {
  count: number
  avgRating: number
}

interface ReviewSectionProps {
  artworkId: string
}

// Composant étoiles
function StarRating({ 
  rating, 
  onRate, 
  interactive = false,
  size = "md"
}: { 
  rating: number
  onRate?: (rating: number) => void
  interactive?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const [hover, setHover] = useState(0)
  
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-colors`}
        >
          <svg
            className={`${sizes[size]} ${
              star <= (hover || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-neutral-600 fill-neutral-600"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ artworkId }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ count: 0, avgRating: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  
  // Formulaire
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  
  // Vérifier si l'utilisateur a déjà laissé un avis
  const userHasReviewed = reviews.some(r => 
    session?.user?.id && r.user.name === session.user.name
  )
  
  useEffect(() => {
    fetchReviews()
  }, [artworkId])
  
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?artworkId=${artworkId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setStats(data.stats || { count: 0, avgRating: 0 })
    } catch (err) {
      console.error("Erreur chargement avis:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError("Veuillez donner une note")
      return
    }
    
    setSubmitting(true)
    setError("")
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId,
          rating,
          title: title || null,
          comment: comment || null
        })
      })
      
      if (res.ok) {
        const newReview = await res.json()
        setReviews([newReview, ...reviews])
        setStats({
          count: stats.count + 1,
          avgRating: Math.round(((stats.avgRating * stats.count) + rating) / (stats.count + 1) * 10) / 10
        })
        setShowForm(false)
        setRating(0)
        setTitle("")
        setComment("")
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors de l'envoi")
      }
    } catch (err) {
      setError("Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-800 rounded w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-neutral-900 p-4 rounded-lg">
              <div className="h-4 bg-neutral-800 rounded w-32 mb-2" />
              <div className="h-3 bg-neutral-800 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-1">Avis clients</h3>
          <div className="flex items-center gap-3">
            <StarRating rating={Math.round(stats.avgRating)} />
            <span className="text-neutral-400">
              {stats.avgRating.toFixed(1)} ({stats.count} avis)
            </span>
          </div>
        </div>
        
        {session && !userHasReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Donner mon avis
          </button>
        )}
      </div>
      
      {/* Formulaire d'avis */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Votre note *</label>
            <StarRating rating={rating} onRate={setRating} interactive size="lg" />
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Titre (optionnel)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Résumez votre avis..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Commentaire (optionnel)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience..."
              rows={4}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none resize-none"
              maxLength={1000}
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Publier mon avis"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-neutral-700 hover:border-white transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      
      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="text-neutral-500 text-center py-8">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-neutral-900/50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || ""}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {review.user.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user.name || "Anonyme"}</span>
                      {review.verified && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-neutral-500">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-medium mb-1">{review.title}</h4>
              )}
              
              {review.comment && (
                <p className="text-neutral-300 text-sm">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
