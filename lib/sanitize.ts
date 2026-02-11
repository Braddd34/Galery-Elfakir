/**
 * Utilitaire de sanitization pour prévenir les attaques XSS.
 * 
 * Nettoie les entrées utilisateur en supprimant le HTML dangereux
 * (balises script, événements onclick, etc.) tout en conservant le texte brut.
 * 
 * Utilisation :
 * import { sanitize } from "@/lib/sanitize"
 * const cleanText = sanitize(userInput)
 */

/**
 * Supprime toutes les balises HTML et entités dangereuses d'un texte.
 * Conserve uniquement le texte brut.
 */
export function sanitize(input: string): string {
  if (!input || typeof input !== "string") return ""
  
  return input
    // Supprimer les balises HTML complètes
    .replace(/<[^>]*>/g, "")
    // Supprimer les événements JavaScript inline
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    // Supprimer les URLs javascript:
    .replace(/javascript\s*:/gi, "")
    // Supprimer les data: URLs potentiellement dangereuses
    .replace(/data\s*:\s*text\/html/gi, "")
    // Nettoyer les espaces multiples
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Sanitize un objet entier (nettoie toutes les valeurs string).
 * Utile pour nettoyer le body d'une requête API d'un coup.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = { ...obj }
  for (const key in cleaned) {
    if (typeof cleaned[key] === "string") {
      (cleaned as Record<string, unknown>)[key] = sanitize(cleaned[key] as string)
    }
  }
  return cleaned
}
