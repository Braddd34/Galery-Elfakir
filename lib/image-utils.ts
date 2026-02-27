const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"

/**
 * Retourne l'URL telle quelle, ou le fallback si vide.
 * Next.js Image gère l'encodage automatiquement.
 */
export function safeImageUrl(url: string | null | undefined): string {
  if (!url || url.trim() === "") return FALLBACK_IMAGE
  return url
}

/**
 * Encode une URL pour les contextes non-navigateur (Three.js TextureLoader).
 * Utilise encodeURI pour gérer les caractères spéciaux (°, accents, etc.)
 */
export function encodeImageUrl(url: string): string {
  try {
    return encodeURI(decodeURI(url))
  } catch {
    try {
      return encodeURI(url)
    } catch {
      return url
    }
  }
}

/**
 * Extrait l'URL de la première image depuis le champ images d'une oeuvre.
 */
export function getArtworkImageUrl(images: unknown): string {
  if (!images) return FALLBACK_IMAGE
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images
    const url = Array.isArray(parsed) ? parsed[0]?.url : null
    return url ? safeImageUrl(url) : FALLBACK_IMAGE
  } catch {
    return FALLBACK_IMAGE
  }
}

/**
 * Extrait toutes les URLs d'images depuis le champ images.
 */
export function getArtworkImages(images: unknown): { url: string }[] {
  const fallback = [{ url: FALLBACK_IMAGE }]
  if (!images) return fallback
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback
    return parsed.map((img: { url?: string }) => ({
      url: img.url ? safeImageUrl(img.url) : FALLBACK_IMAGE,
    }))
  } catch {
    return fallback
  }
}
