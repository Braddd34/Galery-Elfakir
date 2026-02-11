/**
 * Service Worker basique pour le mode PWA.
 * 
 * Stratégie : Cache-first pour les assets statiques,
 * Network-first pour les pages et les API.
 * 
 * Ce fichier est servi depuis /public/sw.js
 * et enregistré par le composant ServiceWorkerRegister.
 */

const CACHE_NAME = "elfakir-v1"

// Assets statiques à mettre en cache au premier chargement
const STATIC_ASSETS = [
  "/",
  "/catalogue",
  "/artistes",
  "/manifest.json"
]

// Installation : pré-cacher les assets de base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activation : nettoyer les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET et les API
  if (request.method !== "GET") return
  if (url.pathname.startsWith("/api/")) return
  if (url.pathname.startsWith("/_next/")) return

  // Pour les images : cache-first
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }).catch(() => {
        // Fallback si hors ligne
        return new Response("", { status: 503 })
      })
    )
    return
  }

  // Pour les pages : network-first avec fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/")
        })
      })
  )
})
