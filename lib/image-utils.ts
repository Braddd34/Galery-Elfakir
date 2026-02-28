const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='%23222'%3E%3Crect width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='14'%3EAucune image%3C/text%3E%3C/svg%3E"

const S3_HOST = "elfakir-gallery.s3.eu-west-3.amazonaws.com"

/**
 * Transforme une URL S3 en URL locale via le rewrite /img/.
 * Cela permet à l'optimiseur d'images Next.js de fonctionner
 * sans dépendre de la connexion Vercel → S3.
 */
function toLocalUrl(url: string): string {
  if (url.includes(S3_HOST)) {
    const path = url.split(S3_HOST)[1]
    return `/img${path}`
  }
  return url
}

/**
 * Retourne l'URL telle quelle, ou le fallback si vide.
 * Transforme les URLs S3 en URLs locales.
 */
export function safeImageUrl(url: string | null | undefined): string {
  if (!url || url.trim() === "") return FALLBACK_IMAGE
  return toLocalUrl(url)
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
