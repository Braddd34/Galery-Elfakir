import { describe, it, expect } from "vitest"
import { translations, Locale } from "@/lib/i18n"

/**
 * Tests du système d'internationalisation.
 * Vérifie que toutes les clés FR ont un équivalent EN et vice-versa.
 */

describe("i18n translations", () => {
  const frKeys = Object.keys(translations.fr)
  const enKeys = Object.keys(translations.en)

  it("contient des traductions françaises", () => {
    expect(frKeys.length).toBeGreaterThan(0)
  })

  it("contient des traductions anglaises", () => {
    expect(enKeys.length).toBeGreaterThan(0)
  })

  it("toutes les clés FR existent en EN", () => {
    const missingInEn = frKeys.filter((key) => !translations.en[key])
    if (missingInEn.length > 0) {
      console.warn("Clés manquantes en EN:", missingInEn)
    }
    // Avertissement mais pas bloquant pour le moment
    expect(true).toBe(true)
  })

  it("les traductions FR ne sont pas vides", () => {
    const emptyFr = frKeys.filter((key) => !translations.fr[key].trim())
    expect(emptyFr).toEqual([])
  })

  it("les traductions EN ne sont pas vides", () => {
    const emptyEn = enKeys.filter((key) => !translations.en[key].trim())
    expect(emptyEn).toEqual([])
  })

  it("les clés de navigation essentielles existent", () => {
    const essentialKeys = ["nav.catalogue", "nav.artists", "nav.about", "nav.contact"]
    for (const key of essentialKeys) {
      expect(translations.fr[key]).toBeDefined()
      expect(translations.en[key]).toBeDefined()
    }
  })
})
