"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { Locale, translations } from "@/lib/i18n"

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key: string) => key
})

/**
 * Hook pour accéder au système de traduction.
 * 
 * Exemple :
 * const { t, locale, setLocale } = useLanguage()
 * <h1>{t("nav.allArtworks")}</h1> → "Toutes les œuvres" ou "All artworks"
 */
export const useLanguage = () => useContext(LanguageContext)

/**
 * Provider de langue qui enveloppe l'application.
 * Sauvegarde le choix de langue dans localStorage.
 * Par défaut : français (fr).
 */
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr")
  const [mounted, setMounted] = useState(false)

  // Charger la langue sauvegardée + synchroniser le cookie
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved && (saved === "fr" || saved === "en")) {
      setLocaleState(saved)
      document.cookie = `locale=${saved};path=/;max-age=31536000;SameSite=Lax`
    } else {
      document.cookie = `locale=fr;path=/;max-age=31536000;SameSite=Lax`
    }
    setMounted(true)
  }, [])

  // Changer la langue et sauvegarder
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
    // Sauvegarder aussi dans un cookie pour le serveur (i18n-server.ts)
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    // Mettre à jour l'attribut lang de la page
    document.documentElement.lang = newLocale
  }, [])

  // Fonction de traduction
  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations["fr"]?.[key] || key
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
