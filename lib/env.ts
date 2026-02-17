/**
 * Validation des variables d'environnement au démarrage.
 * 
 * - Variables CRITIQUES : l'app ne peut pas fonctionner sans elles → erreur bloquante en production.
 * - Variables RECOMMANDÉES : certaines fonctionnalités seront désactivées sans elles → warning.
 */

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
