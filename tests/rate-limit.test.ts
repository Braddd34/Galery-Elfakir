import { describe, it, expect, beforeEach } from "vitest"
import { rateLimit } from "@/lib/rate-limit"

/**
 * Tests du système de rate limiting.
 * Vérifie que les limites de requêtes fonctionnent correctement.
 */

describe("rateLimit", () => {
  let limiter: ReturnType<typeof rateLimit>

  beforeEach(() => {
    // Nouvelle instance à chaque test pour éviter la contamination
    limiter = rateLimit({ interval: 10000 })
  })

  it("autorise les premières requêtes", async () => {
    // 3 requêtes avec une limite de 5 → doit passer
    await expect(limiter.check(5, "test-ip")).resolves.toBeUndefined()
    await expect(limiter.check(5, "test-ip")).resolves.toBeUndefined()
    await expect(limiter.check(5, "test-ip")).resolves.toBeUndefined()
  })

  it("bloque après la limite", async () => {
    // Épuiser les 2 tokens
    await limiter.check(2, "test-ip2")
    await limiter.check(2, "test-ip2")
    
    // La 3ème doit être bloquée
    await expect(limiter.check(2, "test-ip2")).rejects.toBeDefined()
  })

  it("isole les IPs différentes", async () => {
    // Épuiser les tokens d'une IP
    await limiter.check(1, "ip-a")
    await expect(limiter.check(1, "ip-a")).rejects.toBeDefined()

    // Mais une autre IP doit passer
    await expect(limiter.check(1, "ip-b")).resolves.toBeUndefined()
  })
})
