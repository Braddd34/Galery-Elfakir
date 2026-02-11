import { describe, it, expect } from "vitest"
import {
  loginSchema,
  registerSchema,
  contactSchema,
  artworkSchema,
  checkoutAddressSchema,
  newsletterSchema,
} from "@/lib/validations"

/**
 * Tests des schémas de validation Zod.
 * Vérifie que les données valides passent et les données invalides sont rejetées.
 */

describe("loginSchema", () => {
  it("accepte des données valides", () => {
    const result = loginSchema.safeParse({ email: "test@email.com", password: "test" })
    expect(result.success).toBe(true)
  })

  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "invalide", password: "test" })
    expect(result.success).toBe(false)
  })

  it("rejette un email vide", () => {
    const result = loginSchema.safeParse({ email: "", password: "test" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const validData = {
    name: "Jean Dupont",
    email: "jean@test.com",
    password: "Motdepasse1",
    confirmPassword: "Motdepasse1",
  }

  it("accepte des données valides", () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejette si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "Autre1234" })
    expect(result.success).toBe(false)
  })

  it("rejette un mot de passe sans majuscule", () => {
    const result = registerSchema.safeParse({ ...validData, password: "motdepasse1", confirmPassword: "motdepasse1" })
    expect(result.success).toBe(false)
  })

  it("rejette un mot de passe sans chiffre", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Motdepasse", confirmPassword: "Motdepasse" })
    expect(result.success).toBe(false)
  })

  it("rejette un nom trop court", () => {
    const result = registerSchema.safeParse({ ...validData, name: "A" })
    expect(result.success).toBe(false)
  })
})

describe("contactSchema", () => {
  const validData = {
    name: "Jean Dupont",
    email: "jean@test.com",
    subject: "Demande d'information",
    message: "Bonjour, je souhaite en savoir plus sur vos œuvres et vos artistes disponibles.",
  }

  it("accepte des données valides", () => {
    const result = contactSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejette un message trop court", () => {
    const result = contactSchema.safeParse({ ...validData, message: "Bonjour" })
    expect(result.success).toBe(false)
  })
})

describe("artworkSchema", () => {
  const validData = {
    title: "Paysage abstrait",
    description: "Une œuvre abstraite représentant un paysage imaginaire avec des couleurs vives et des formes géométriques.",
    category: "PAINTING" as const,
    year: 2024,
    width: 100,
    height: 80,
    medium: "Huile sur toile",
    price: 2500,
  }

  it("accepte des données valides", () => {
    const result = artworkSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejette un prix négatif", () => {
    const result = artworkSchema.safeParse({ ...validData, price: -100 })
    expect(result.success).toBe(false)
  })

  it("rejette une catégorie invalide", () => {
    const result = artworkSchema.safeParse({ ...validData, category: "INVALIDE" })
    expect(result.success).toBe(false)
  })

  it("rejette une année dans le futur", () => {
    const result = artworkSchema.safeParse({ ...validData, year: 2050 })
    expect(result.success).toBe(false)
  })
})

describe("checkoutAddressSchema", () => {
  const validData = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@test.com",
    address: "12 rue de la Paix",
    postalCode: "75001",
    city: "Paris",
    country: "France",
  }

  it("accepte des données valides", () => {
    const result = checkoutAddressSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejette sans adresse", () => {
    const { address, ...noAddress } = validData
    const result = checkoutAddressSchema.safeParse(noAddress)
    expect(result.success).toBe(false)
  })

  it("rejette un email invalide", () => {
    const result = checkoutAddressSchema.safeParse({ ...validData, email: "pas-un-email" })
    expect(result.success).toBe(false)
  })
})

describe("newsletterSchema", () => {
  it("accepte un email valide", () => {
    const result = newsletterSchema.safeParse({ email: "test@test.com" })
    expect(result.success).toBe(true)
  })

  it("rejette un email invalide", () => {
    const result = newsletterSchema.safeParse({ email: "invalide" })
    expect(result.success).toBe(false)
  })
})
