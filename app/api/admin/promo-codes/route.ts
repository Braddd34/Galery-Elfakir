import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

// GET - Lister tous les codes promo
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ promoCodes })
  } catch (error) {
    console.error("Erreur liste codes promo:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Créer un nouveau code promo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { code, discountPercent, discountAmount, minPurchase, maxUses, expiresAt } = body

    if (!code || (!discountPercent && !discountAmount)) {
      return NextResponse.json(
        { error: "Le code et au moins un type de réduction sont requis" },
        { status: 400 }
      )
    }

    const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) {
      return NextResponse.json({ error: "Ce code existe déjà" }, { status: 400 })
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: discountPercent || null,
        discountAmount: discountAmount || null,
        minPurchase: minPurchase || null,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    await logAudit({
      userId: session.user.id,
      action: "create_promo_code",
      target: promoCode.id,
      details: { code: promoCode.code }
    })

    return NextResponse.json({ success: true, promoCode })
  } catch (error) {
    console.error("Erreur création code promo:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Activer/désactiver un code promo
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id, active } = await request.json()

    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "id et active requis" }, { status: 400 })
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: { active }
    })

    await logAudit({
      userId: session.user.id,
      action: "update_promo_code",
      target: id,
      details: { active }
    })

    return NextResponse.json({ success: true, promoCode })
  } catch (error) {
    console.error("Erreur mise à jour code promo:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
