import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { formLimiter, getClientIP } from "@/lib/rate-limit"
import { newsletterSchema } from "@/lib/validations"

// POST: S'inscrire à la newsletter
export async function POST(request: NextRequest) {
  try {
    // Rate limiting : max 5 inscriptions/min par IP
    const ip = getClientIP(request)
    const rateLimitResult = await formLimiter.check(ip, 5)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard" }, { status: 429 })
    }

    const body = await request.json()

    // Validation de l'email avec Zod
    const validation = newsletterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Adresse email invalide" },
        { status: 400 }
      )
    }
    const { email } = validation.data

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
