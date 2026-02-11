"use client"

import { useEffect } from "react"

/**
 * Composant invisible qui enregistre le Service Worker.
 * Le SW permet :
 * - La mise en cache des assets statiques et images
 * - Le fonctionnement hors-ligne basique (pages déjà visitées)
 * - L'installation en tant que PWA sur mobile
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW enregistré:", registration.scope)
        })
        .catch((error) => {
          console.log("SW erreur:", error)
        })
    }
  }, [])

  return null
}
