const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"

/**
 * Encode une URL d'image pour gérer les caractères spéciaux (°, accents, etc.)
 * Les URLs S3 peuvent contenir des caractères non-ASCII dans les noms de fichiers.
 */
export function safeImageUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_IMAGE
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
 * Gère le format string JSON ou tableau d'objets.
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
