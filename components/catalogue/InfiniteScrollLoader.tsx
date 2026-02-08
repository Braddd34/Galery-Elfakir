"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import ArtworkCard from "./ArtworkCard"
import ArtworkListItem from "./ArtworkListItem"

interface InfiniteScrollLoaderProps {
  initialArtworks: any[]
  totalCount: number
  currentView: "grid" | "list"
  searchParams: Record<string, string | undefined>
}

export default function InfiniteScrollLoader({
  initialArtworks,
  totalCount,
  currentView,
  searchParams
}: InfiniteScrollLoaderProps) {
  const [artworks, setArtworks] = useState<any[]>(initialArtworks)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialArtworks.length < totalCount)
  const observerRef = useRef<HTMLDivElement>(null)
  
  const LIMIT = 12
  
  // Réinitialiser quand les filtres changent
  useEffect(() => {
    setArtworks(initialArtworks)
    setPage(1)
    setHasMore(initialArtworks.length < totalCount)
  }, [initialArtworks, totalCount])
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      params.set("page", String(page + 1))
      params.set("limit", String(LIMIT))
      
      // Ajouter tous les filtres actifs
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== "view") {
          params.set(key, value)
        }
      })
      
      const res = await fetch(`/api/catalogue?${params.toString()}`)
      const data = await res.json()
      
      if (data.artworks?.length > 0) {
        setArtworks(prev => [...prev, ...data.artworks])
        setPage(prev => prev + 1)
        setHasMore(data.pagination.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error("Erreur chargement:", err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, searchParams])
  
  // Observer pour le scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    )
    
    if (observerRef.current) {
      observer.observe(observerRef.current)
    }
    
    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])
  
  return (
    <>
      {currentView === "list" ? (
        <div className="space-y-4">
          {artworks.map((artwork) => (
            <ArtworkListItem key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
      
      {/* Trigger pour le chargement infini */}
      <div ref={observerRef} className="py-8">
        {loading && (
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-neutral-400 text-sm">Chargement...</span>
          </div>
        )}
        
        {!hasMore && artworks.length > 0 && (
          <p className="text-center text-neutral-500 text-sm">
            {artworks.length} œuvre{artworks.length > 1 ? "s" : ""} affichée{artworks.length > 1 ? "s" : ""} sur {totalCount}
          </p>
        )}
      </div>
    </>
  )
}
