/**
 * Système de rate limiting simple basé sur un Map en mémoire.
 * 
 * Limite le nombre de requêtes par IP sur une fenêtre de temps donnée.
 * En production, on pourrait utiliser Redis pour une solution distribuée,
 * mais pour un site de cette taille, une Map en mémoire suffit.
 * 
 * Utilisation :
 * const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })
 * const { success } = await limiter.check(ip, 10) // max 10 req/min
 */

interface RateLimitOptions {
  interval: number       // Fenêtre de temps en ms (ex: 60000 = 1 minute)
  uniqueTokenPerInterval: number  // Nombre max de tokens uniques à stocker
}

interface RateLimitResult {
  success: boolean
  remaining: number
  limit: number
}

const tokenCache = new Map<string, { count: number; resetTime: number }>()

// Nettoyer le cache périodiquement pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of tokenCache.entries()) {
    if (now > value.resetTime) {
      tokenCache.delete(key)
    }
  }
}, 60000) // Nettoyage toutes les minutes

export function rateLimit(options: RateLimitOptions) {
  return {
    check: async (token: string, limit: number): Promise<RateLimitResult> => {
      const now = Date.now()
      const tokenData = tokenCache.get(token)

      // Si pas de données ou fenêtre expirée, réinitialiser
      if (!tokenData || now > tokenData.resetTime) {
        // Vérifier qu'on ne dépasse pas le nombre max de tokens
        if (tokenCache.size >= options.uniqueTokenPerInterval) {
          // Supprimer les entrées expirées
          for (const [key, value] of tokenCache.entries()) {
            if (now > value.resetTime) {
              tokenCache.delete(key)
            }
          }
        }

        tokenCache.set(token, {
          count: 1,
          resetTime: now + options.interval
        })

        return { success: true, remaining: limit - 1, limit }
      }

      // Incrémenter le compteur
      tokenData.count++
      tokenCache.set(token, tokenData)

      if (tokenData.count > limit) {
        return { success: false, remaining: 0, limit }
      }

      return { success: true, remaining: limit - tokenData.count, limit }
    }
  }
}

/**
 * Limiteur pré-configuré pour les routes d'authentification.
 * Maximum 5 tentatives par minute par IP.
 */
export const authLimiter = rateLimit({
  interval: 60 * 1000,        // 1 minute
  uniqueTokenPerInterval: 500
})

/**
 * Limiteur pré-configuré pour les routes d'upload.
 * Maximum 10 uploads par minute par IP.
 */
export const uploadLimiter = rateLimit({
  interval: 60 * 1000,        // 1 minute
  uniqueTokenPerInterval: 500
})

/**
 * Limiteur pré-configuré pour les formulaires publics (contact, etc.).
 * Maximum 3 soumissions par minute par IP.
 */
export const formLimiter = rateLimit({
  interval: 60 * 1000,        // 1 minute
  uniqueTokenPerInterval: 500
})

/**
 * Extraire l'IP du client depuis les headers de la requête.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return "unknown"
}
