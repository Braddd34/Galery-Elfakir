"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  artistId: string
  className?: string
}

export default function FollowButton({ artistId, className = "" }: FollowButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  useEffect(() => {
    fetchFollowStatus()
  }, [artistId])
  
  const fetchFollowStatus = async () => {
    try {
      const res = await fetch(`/api/follow?artistId=${artistId}`)
      const data = await res.json()
      setIsFollowing(data.isFollowing)
      setFollowersCount(data.followersCount)
    } catch (err) {
      console.error("Erreur chargement statut follow:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFollow = async () => {
    if (!session) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    
    setUpdating(true)
    
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId })
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.isFollowing)
        setFollowersCount(data.followersCount)
      }
    } catch (err) {
      console.error("Erreur follow:", err)
    } finally {
      setUpdating(false)
    }
  }
  
  if (loading) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-neutral-800 text-neutral-500 rounded animate-pulse ${className}`}
      >
        Chargement...
      </button>
    )
  }
  
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleFollow}
        disabled={updating}
        className={`
          px-5 py-2.5 font-medium transition-all duration-200
          ${isFollowing 
            ? "bg-transparent border border-white text-white hover:bg-white hover:text-black" 
            : "bg-white text-black hover:bg-neutral-200"
          }
          disabled:opacity-50
          ${className}
        `}
      >
        {updating ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Chargement
          </span>
        ) : isFollowing ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Suivi
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Suivre
          </span>
        )}
      </button>
      
      <span className="text-sm text-neutral-400">
        {followersCount} {followersCount <= 1 ? "abonné" : "abonnés"}
      </span>
    </div>
  )
}
