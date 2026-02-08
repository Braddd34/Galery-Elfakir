"use client"

import { useState, useEffect } from "react"

/**
 * Composant qui surveille la connexion réseau du navigateur.
 * Affiche un bandeau d'avertissement quand la connexion est perdue
 * et un message de confirmation quand elle revient.
 */
export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Vérifier l'état initial
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setShowReconnected(true)
        setTimeout(() => setShowReconnected(false), 3000)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [wasOffline])

  // Bandeau hors ligne
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white text-center py-2 px-4 text-sm animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414z" />
          </svg>
          <span>Connexion perdue — Vérifiez votre connexion internet</span>
        </div>
      </div>
    )
  }

  // Bandeau reconnecté
  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[200] bg-green-600 text-white text-center py-2 px-4 text-sm animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Connexion rétablie</span>
        </div>
      </div>
    )
  }

  return null
}
