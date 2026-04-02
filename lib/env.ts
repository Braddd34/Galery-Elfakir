/**
 * Validation des variables d'environnement au démarrage.
 * 
 * - Variables CRITIQUES : l'app ne peut pas fonctionner sans elles → erreur bloquante en production.
 * - Variables RECOMMANDÉES : certaines fonctionnalités seront désactivées sans elles → warning.
 */

const NEXTAUTH_SECRET_MIN_LEN = 32

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
] as const

const recommendedEnvVars = [
  "RESEND_API_KEY",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
] as const

export function validateEnv() {
  const missing: string[] = []
  const missingRecommended: string[] = []

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  for (const key of recommendedEnvVars) {
    if (!process.env[key]) {
      missingRecommended.push(key)
    }
  }

  if (missing.length > 0) {
    const message = `ERREUR CRITIQUE — Variables d'environnement manquantes: ${missing.join(", ")}. L'application ne peut pas démarrer.`
    console.error(`❌ ${message}`)
    if (process.env.NODE_ENV === "production") {
      throw new Error(message)
    }
  }

  if (process.env.NODE_ENV === "production" && process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length < NEXTAUTH_SECRET_MIN_LEN) {
      console.warn(
        `⚠️ NEXTAUTH_SECRET est trop court (minimum ${NEXTAUTH_SECRET_MIN_LEN} caractères recommandé pour la production). Générez-en un avec: openssl rand -base64 32`
      )
    }
  }

  if (process.env.NODE_ENV === "production" && !process.env.CRON_SECRET?.trim()) {
    console.warn(
      "⚠️ CRON_SECRET manquant : le nettoyage planifié (/api/cron/cleanup) refusera les appels jusqu'à ce que vous définissiez CRON_SECRET sur Vercel (voir vercel.json)."
    )
  }

  if (process.env.NODE_ENV === "production" && process.env.TURNSTILE_SECRET_KEY?.trim()) {
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) {
      console.warn(
        "⚠️ TURNSTILE_SECRET_KEY est défini sans NEXT_PUBLIC_TURNSTILE_SITE_KEY : le widget ne s'affichera pas et la connexion sera refusée. Ajoutez la clé site Turnstile (publique)."
      )
    }
  }

  if (missingRecommended.length > 0) {
    console.warn(
      `⚠️ Variables d'environnement recommandées manquantes: ${missingRecommended.join(", ")}. Certaines fonctionnalités (emails, etc.) seront désactivées.`
    )
  }
}

// Exécuter la validation immédiatement à l'import
if (typeof window === "undefined") {
  validateEnv()
}
