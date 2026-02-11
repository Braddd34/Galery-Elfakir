/**
 * Module d'analytics pour tracker les événements métier.
 * 
 * Utilise Vercel Analytics (track) pour enregistrer des événements personnalisés.
 * Les événements sont envoyés côté client uniquement.
 * 
 * Événements suivis :
 * - artwork_view : visite d'une page d'œuvre
 * - artwork_add_to_cart : ajout d'une œuvre au panier
 * - artwork_favorite : ajout aux favoris
 * - artwork_share : partage d'une œuvre
 * - checkout_start : début du processus de commande
 * - checkout_complete : commande finalisée
 * - artist_follow : suivi d'un artiste
 * - search : recherche dans le catalogue
 * - filter_use : utilisation d'un filtre
 * - review_submit : soumission d'un avis
 * - contact_artist : contact d'un artiste
 * 
 * Utilisation :
 *   import { trackEvent } from "@/lib/analytics"
 *   trackEvent("artwork_view", { artworkId: "abc", category: "PAINTING", price: 1200 })
 */

// Type des événements supportés
type EventName =
  | "artwork_view"
  | "artwork_add_to_cart"
  | "artwork_remove_from_cart"
  | "artwork_favorite"
  | "artwork_unfavorite"
  | "artwork_share"
  | "checkout_start"
  | "checkout_address_complete"
  | "checkout_complete"
  | "artist_follow"
  | "artist_unfollow"
  | "artist_contact"
  | "search"
  | "filter_use"
  | "review_submit"
  | "certificate_download"
  | "lightbox_open"
  | "page_view"

// Données optionnelles associées aux événements
interface EventData {
  artworkId?: string
  artworkTitle?: string
  category?: string
  price?: number
  artistId?: string
  artistName?: string
  query?: string
  filterType?: string
  filterValue?: string
  rating?: number
  source?: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Envoie un événement de tracking.
 * Utilise la méthode track() de Vercel Analytics si disponible.
 * Si Vercel Analytics n'est pas chargé, log en dev pour debug.
 */
export function trackEvent(name: EventName, data?: EventData): void {
  try {
    // Vercel Analytics track (si le script est chargé)
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va("event", {
        name,
        ...cleanData(data)
      })
    }

    // Log en développement pour debug
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${name}`, data || "")
    }
  } catch (error) {
    // Ne jamais bloquer l'UX pour du tracking
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics] Erreur:", error)
    }
  }
}

/**
 * Nettoyer les données : enlever les valeurs undefined et limiter la taille des strings.
 */
function cleanData(data?: EventData): Record<string, string | number | boolean> {
  if (!data) return {}
  
  const cleaned: Record<string, string | number | boolean> = {}
  const entries = Object.entries(data)
  
  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0]
    const value = entries[i][1]
    if (value !== undefined && value !== null) {
      // Limiter les strings à 100 caractères pour le tracking
      if (typeof value === "string") {
        cleaned[key] = value.substring(0, 100)
      } else {
        cleaned[key] = value
      }
    }
  }
  
  return cleaned
}

/**
 * Helper pour tracker une vue d'œuvre avec les bonnes données.
 */
export function trackArtworkView(artwork: {
  id: string
  title: string
  category: string
  price: number
  artistName?: string
}) {
  trackEvent("artwork_view", {
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    category: artwork.category,
    price: artwork.price,
    artistName: artwork.artistName
  })
}

/**
 * Helper pour tracker un ajout au panier.
 */
export function trackAddToCart(artwork: {
  id: string
  title: string
  price: number
}) {
  trackEvent("artwork_add_to_cart", {
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    price: artwork.price
  })
}

/**
 * Helper pour tracker une recherche.
 */
export function trackSearch(query: string, resultsCount?: number) {
  trackEvent("search", {
    query,
    ...(resultsCount !== undefined ? { source: `${resultsCount} résultats` } : {})
  })
}

/**
 * Helper pour tracker l'utilisation d'un filtre.
 */
export function trackFilterUse(filterType: string, filterValue: string) {
  trackEvent("filter_use", {
    filterType,
    filterValue
  })
}
