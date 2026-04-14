import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = body.code
    const subtotal = typeof body.subtotal === "number" && !isNaN(body.subtotal) ? body.subtotal : 0

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 })
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!promoCode) {
      return NextResponse.json({ error: "Code promo invalide" }, { status: 404 })
    }

    if (!promoCode.active) {
      return NextResponse.json({ error: "Ce code promo n'est plus actif" }, { status: 400 })
    }

    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Ce code promo a expiré" }, { status: 400 })
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json({ error: "Ce code promo a atteint son nombre maximum d'utilisations" }, { status: 400 })
    }

    if (promoCode.minPurchase && subtotal < promoCode.minPurchase) {
      return NextResponse.json({
        error: `Montant minimum requis : €${promoCode.minPurchase}`
      }, { status: 400 })
    }

    // Calculer la réduction
    let discount = 0
    let type: "percent" | "fixed" = "fixed"

    if (promoCode.discountPercent) {
      discount = Math.round((subtotal * promoCode.discountPercent) / 100 * 100) / 100
      type = "percent"
    } else if (promoCode.discountAmount) {
      discount = Math.min(promoCode.discountAmount, subtotal)
      type = "fixed"
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type,
      discountPercent: promoCode.discountPercent,
      discountAmount: promoCode.discountAmount,
      discount,
      newTotal: Math.max(0, subtotal - discount)
    })
  } catch (error) {
    console.error("Erreur validation code promo:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
