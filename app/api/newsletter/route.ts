import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { formLimiter, getClientIP } from "@/lib/rate-limit"

// POST: S'inscrire à la newsletter
export async function POST(request: NextRequest) {
  try {
    // Rate limiting : max 5 inscriptions/min par IP
    const ip = getClientIP(request)
    try {
      await formLimiter.check(5, ip)
    } catch {
      return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard" }, { status: 429 })
    }

    const { email } = await request.json()

    // Validation de l'email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { error: "Cette adresse est déjà inscrite" },
          { status: 400 }
        )
      } else {
        // Réactiver l'abonnement
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { active: true }
        })
        return NextResponse.json({
          success: true,
          message: "Votre abonnement a été réactivé"
        })
      }
    }

    // Créer le nouvel abonné
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Merci pour votre inscription !"
    })

  } catch (error) {
    console.error("Erreur newsletter:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
