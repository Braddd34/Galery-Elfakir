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
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@elfakirgallery",
  linkedin: "",
}

// Limites
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_CART_ITEMS = 10
export const ITEMS_PER_PAGE = 12

// Monnaie
export const DEFAULT_CURRENCY = "EUR"
export const CURRENCY_SYMBOL = "€"

// Images par défaut (SVG inline pour ne dépendre d'aucun service externe)
export const DEFAULT_ARTWORK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='%23222'%3E%3Crect width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='14'%3EAucune image%3C/text%3E%3C/svg%3E"
export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='%23222'%3E%3Crect width='200' height='200' rx='100'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-family='system-ui' font-size='60'%3E%3F%3C/text%3E%3C/svg%3E"
