/**
 * Validation des variables d'environnement au démarrage.
 * 
 * Vérifie que les variables essentielles sont définies.
 * Si une variable critique manque, affiche un avertissement en console.
 * 
 * Ce fichier est importé au démarrage de l'application.
 */

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const

const recommendedEnvVars = [
  "RESEND_API_KEY",
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
    console.error(
      `⚠️ Variables d'environnement REQUISES manquantes: ${missing.join(", ")}. L'application pourrait ne pas fonctionner correctement.`
    )
  }

  if (missingRecommended.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `💡 Variables d'environnement recommandées manquantes: ${missingRecommended.join(", ")}`
    )
  }
}

// Exécuter la validation immédiatement à l'import
if (typeof window === "undefined") {
  validateEnv()
}
