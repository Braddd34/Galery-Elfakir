/**
 * Envoie un événement de tracking panier à l'API.
 * Fonctionne côté client uniquement (fetch vers /api/cart/events).
 * Le sessionId est généré automatiquement pour les visiteurs non connectés.
 */

const SESSION_KEY = "elfakir-cart-session"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

export async function trackCartEvent(
  artworkId: string,
  action: "add" | "remove" | "checkout"
): Promise<void> {
  try {
    await fetch("/api/cart/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artworkId,
        action,
        sessionId: getSessionId(),
      }),
    })
  } catch {
    // Ne jamais bloquer l'UX pour du tracking
  }
}
