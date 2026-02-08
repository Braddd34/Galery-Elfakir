"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Exhibition {
  id: string
  title: string
  description: string | null
  location: string
  city: string | null
  country: string | null
  startDate: string
  endDate: string | null
  imageUrl: string | null
  link: string | null
}

interface ExhibitionsGalleryProps {
  artistId: string
}

export default function ExhibitionsGallery({ artistId }: ExhibitionsGalleryProps) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchExhibitions()
  }, [artistId])
  
  const fetchExhibitions = async () => {
    try {
      const res = await fetch(`/api/artist/exhibitions?artistId=${artistId}`)
      const data = await res.json()
      setExhibitions(data || [])
    } catch (err) {
      console.error("Erreur chargement expositions:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    })
  }
  
  const isOngoing = (exhibition: Exhibition) => {
    const now = new Date()
    const start = new Date(exhibition.startDate)
    const end = exhibition.endDate ? new Date(exhibition.endDate) : null
    return start <= now && (!end || end >= now)
  }
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-32 h-24 bg-neutral-800 rounded" />
            <div className="flex-1">
              <div className="h-5 bg-neutral-800 rounded w-48 mb-2" />
              <div className="h-4 bg-neutral-800 rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (exhibitions.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Expositions</h3>
      
      <div className="space-y-4">
        {exhibitions.map((exhibition) => (
          <div 
            key={exhibition.id}
            className="flex gap-4 p-4 bg-neutral-900/50 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            {exhibition.imageUrl ? (
              <div className="relative w-32 h-24 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={exhibition.imageUrl}
                  alt={exhibition.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-24 flex-shrink-0 bg-neutral-800 rounded flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium truncate">{exhibition.title}</h4>
                {isOngoing(exhibition) && (
                  <span className="flex-shrink-0 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                    En cours
                  </span>
                )}
              </div>
              
              <p className="text-sm text-neutral-400 mt-1">
                {exhibition.location}
                {exhibition.city && `, ${exhibition.city}`}
                {exhibition.country && ` (${exhibition.country})`}
              </p>
              
              <p className="text-sm text-neutral-500 mt-1">
                {formatDate(exhibition.startDate)}
                {exhibition.endDate && ` - ${formatDate(exhibition.endDate)}`}
              </p>
              
              {exhibition.description && (
                <p className="text-sm text-neutral-400 mt-2 line-clamp-2">
                  {exhibition.description}
                </p>
              )}
              
              {exhibition.link && (
                <a
                  href={exhibition.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white hover:underline mt-2"
                >
                  En savoir plus
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
