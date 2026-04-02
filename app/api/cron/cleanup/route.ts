import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * GET /api/cron/cleanup
 * Cron Vercel quotidien (3h du matin).
 * Nettoie les tokens expires, les anciennes sessions,
 * les tentatives de login et les evenements panier anciens.
 *
 * Securise par le header Authorization Bearer CRON_SECRET
 * (fourni automatiquement par Vercel pour les crons).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) {
      return NextResponse.json(
        { error: "Cron non configuré (CRON_SECRET manquant)" },
        { status: 503 }
      )
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const now = new Date()
  const results: Record<string, number> = {}

  try {
    // 1. Tokens de verification expires
    const verificationTokens = await prisma.verificationToken.deleteMany({
      where: { expires: { lt: now } }
    })
    results.verificationTokens = verificationTokens.count

    // 2. Tokens de reset de mot de passe expires
    const passwordTokens = await prisma.passwordResetToken.deleteMany({
      where: { expires: { lt: now } }
    })
    results.passwordResetTokens = passwordTokens.count

    // 3. Tokens de verification email expires
    const emailTokens = await prisma.emailVerificationToken.deleteMany({
      where: { expires: { lt: now } }
    })
    results.emailVerificationTokens = emailTokens.count

    // 4. Sessions expirees
    const sessions = await prisma.session.deleteMany({
      where: { expires: { lt: now } }
    })
    results.sessions = sessions.count

    // 5. Tentatives de login > 24h
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const loginAttempts = await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: oneDayAgo } }
    })
    results.loginAttempts = loginAttempts.count

    // 6. Evenements panier > 90 jours
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const cartEvents = await prisma.cartEvent.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } }
    })
    results.cartEvents = cartEvents.count

    console.log("Cron cleanup completed:", results)

    return NextResponse.json({
      success: true,
      cleaned: results,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Erreur cron cleanup:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
