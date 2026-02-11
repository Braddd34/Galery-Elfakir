"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

interface ViewTrackerProps {
  artworkId: string
}

/**
 * Composant invisible qui :
 * 1. Envoie une vue à l'API (compteur DB) après 2s de lecture
 * 2. Envoie un événement analytics pour le tracking métier
 */
export default function ViewTracker({ artworkId }: ViewTrackerProps) {
  useEffect(() => {
    // Enregistrer la vue après un court délai pour éviter les comptages accidentels
    const timer = setTimeout(() => {
      fetch(`/api/artwork/${artworkId}/view`, {
        method: "POST"
      }).catch(console.error)
      
      // Tracking analytics
      trackEvent("artwork_view", { artworkId })
    }, 2000) // 2 secondes de lecture minimum
    
    return () => clearTimeout(timer)
  }, [artworkId])
  
  // Composant invisible
  return null
}
