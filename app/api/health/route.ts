import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/health
 * Endpoint de santé public, conçu pour être pingué par un service de monitoring
 * (BetterStack, UptimeRobot, etc.).
 *
 * Vérifie :
 *  - Que l'application répond
 *  - Que la base de données est joignable (SELECT 1)
 *
 * Réponses :
 *  - 200 { status: "ok",  ... }   → tout va bien
 *  - 503 { status: "error", ... } → un sous-système est down
 *
 * Volontairement pas d'auth : doit pouvoir être pingué depuis l'extérieur.
 * Ne renvoie aucune info sensible.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const startedAt = Date.now()
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {}

  try {
    const t0 = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = { ok: true, latencyMs: Date.now() - t0 }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown"
    checks.database = { ok: false, error: message }
  }

  const allOk = Object.values(checks).every(c => c.ok)
  const totalLatencyMs = Date.now() - startedAt

  const body = {
    status: allOk ? "ok" : "error",
    timestamp: new Date().toISOString(),
    latencyMs: totalLatencyMs,
    checks,
  }

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
