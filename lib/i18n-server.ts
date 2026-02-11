import { cookies } from "next/headers"
import { translations, Locale } from "./i18n"

/**
 * Utilitaire de traduction côté serveur.
 * 
 * Comme useLanguage() est un hook React client, on ne peut pas l'utiliser 
 * dans les Server Components (app/page.tsx, etc.).
 * 
 * Cette fonction lit la locale depuis les cookies (définis par LanguageProvider côté client)
 * et retourne une fonction de traduction identique à celle du client.
 * 
 * Utilisation dans un Server Component :
 *   import { getServerTranslation } from "@/lib/i18n-server"
 *   const t = getServerTranslation()
 *   <h1>{t("home.featuredTitle")}</h1>
 */
export function getServerTranslation(): (key: string) => string {
  let locale: Locale = "fr"
  
  try {
    const cookieStore = cookies()
    const localeCookie = cookieStore.get("locale")
    if (localeCookie?.value === "en") {
      locale = "en"
    }
  } catch {
    // En cas d'erreur (ex: appelé hors d'un Server Component), fallback FR
  }

  return function t(key: string): string {
    return translations[locale][key] || translations["fr"][key] || key
  }
}
