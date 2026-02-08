"use client"

import { useEffect } from "react"

interface ViewTrackerProps {
  artworkId: string
}

export default function ViewTracker({ artworkId }: ViewTrackerProps) {
  useEffect(() => {
    // Enregistrer la vue après un court délai pour éviter les comptages accidentels
    const timer = setTimeout(() => {
      fetch(`/api/artwork/${artworkId}/view`, {
        method: "POST"
      }).catch(console.error)
    }, 2000) // 2 secondes de lecture minimum
    
    return () => clearTimeout(timer)
  }, [artworkId])
  
  // Composant invisible
  return null
}
