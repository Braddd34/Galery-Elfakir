"use client"

import { useLanguage } from "@/components/providers/LanguageProvider"

/**
 * Bouton toggle pour changer la langue (FR ↔ EN).
 * Affiché dans le header. Alterne entre français et anglais.
 */
export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <button
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium tracking-wider uppercase text-neutral-400 hover:text-white transition-colors rounded"
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
      title={locale === "fr" ? "Switch to English" : "Passer en français"}
    >
      <span className={locale === "fr" ? "text-white" : "text-neutral-500"}>FR</span>
      <span className="text-neutral-600">/</span>
      <span className={locale === "en" ? "text-white" : "text-neutral-500"}>EN</span>
    </button>
  )
}
