/**
 * Constantes centralisées du site.
 * 
 * Regroupe toutes les valeurs hardcodées en un seul endroit
 * pour faciliter la maintenance. Si tu veux changer l'URL du site,
 * l'email de contact, etc., c'est ici.
 * 
 * Les variables NEXT_PUBLIC_* sont lisibles côté client et serveur.
 * Les variables sans ce préfixe ne sont lisibles que côté serveur.
 */

// URL du site (utilisée pour les liens absolus, le SEO, les emails)
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://galeryelfakir.vercel.app"

// Nom de la galerie
export const SITE_NAME = "ELFAKIR Gallery"
export const SITE_NAME_SHORT = "ELFAKIR"

// Contact
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@elfakir.art"
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+33 1 23 45 67 89"

// Réseaux sociaux
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/elfakir.gallery",
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/elfakirgallery",
  linkedin: "",
}

// Limites
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_CART_ITEMS = 10
export const ITEMS_PER_PAGE = 12

// Monnaie
export const DEFAULT_CURRENCY = "EUR"
export const CURRENCY_SYMBOL = "€"

// Images par défaut
export const DEFAULT_ARTWORK_IMAGE = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
