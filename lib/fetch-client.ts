/**
 * Utilitaire de requête HTTP côté client avec gestion d'erreurs réseau.
 * 
 * - Timeout configurable (évite les requêtes qui restent bloquées indéfiniment)
 * - Messages d'erreur clairs en français
 * - Retry automatique optionnel en cas d'échec réseau
 * 
 * Utilisation :
 *   import { fetchClient } from "@/lib/fetch-client"
 *   const data = await fetchClient("/api/artworks", { timeout: 10000 })
 */

interface FetchClientOptions extends RequestInit {
  timeout?: number    // Timeout en ms (défaut: 15000 = 15 secondes)
  retries?: number    // Nombre de tentatives en cas d'échec réseau (défaut: 0)
  retryDelay?: number // Délai entre les tentatives en ms (défaut: 1000)
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NetworkError"
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "La requête a pris trop de temps. Vérifiez votre connexion internet.") {
    super(message)
    this.name = "TimeoutError"
  }
}

export class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * Effectue une requête HTTP avec gestion de timeout et d'erreurs réseau.
 */
export async function fetchClient<T = any>(
  url: string,
  options: FetchClientOptions = {}
): Promise<T> {
  const { 
    timeout = 15000, 
    retries = 0, 
    retryDelay = 1000,
    ...fetchOptions 
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Créer un AbortController pour le timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Vérifier le statut HTTP
      if (!response.ok) {
        let errorMessage = "Erreur serveur"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {}

        throw new ApiError(errorMessage, response.status)
      }

      // Parser la réponse JSON
      const data = await response.json()
      return data as T

    } catch (error: any) {
      lastError = error

      // Erreur de timeout (AbortController)
      if (error.name === "AbortError") {
        lastError = new TimeoutError()
      }
      // Erreur réseau (pas de connexion, DNS, etc.)
      else if (error.name === "TypeError" && error.message.includes("fetch")) {
        lastError = new NetworkError(
          "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
        )
      }
      // Erreur API (ne pas retenter)
      else if (error instanceof ApiError) {
        throw error
      }

      // Si on a encore des tentatives, attendre avant de réessayer
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  throw lastError || new NetworkError("Erreur inconnue")
}

/**
 * Affiche un message d'erreur adapté au type d'erreur.
 * Utile pour les composants UI qui affichent des toasts.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof TimeoutError) {
    return "La requête a pris trop de temps. Réessayez."
  }
  if (error instanceof NetworkError) {
    return "Connexion perdue. Vérifiez votre connexion internet."
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return "Vous devez être connecté pour effectuer cette action."
    if (error.status === 403) return "Vous n'avez pas les droits nécessaires."
    if (error.status === 404) return "La ressource demandée n'existe pas."
    if (error.status >= 500) return "Erreur serveur. Réessayez dans quelques instants."
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Une erreur inattendue s'est produite."
}
