import { NextRequest, NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/emails"
import { formLimiter, getClientIP } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting : max 3 messages par minute par IP
    const ip = getClientIP(request)
    const { success } = await formLimiter.check(`contact-${ip}`, 3)
    if (!success) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Veuillez réessayer dans une minute." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    // Validation longueur
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "Un ou plusieurs champs dépassent la limite autorisée" },
        { status: 400 }
      )
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      )
    }

    // Envoyer l'email
    const result = await sendContactEmail(name, email, subject, message)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais."
      })
    } else {
      // En cas d'erreur d'envoi, on log mais on ne bloque pas l'utilisateur
      console.error("Erreur envoi email contact:", result.error)
      return NextResponse.json({
        success: true,
        message: "Message reçu ! Nous vous répondrons bientôt."
      })
    }

  } catch (error) {
    console.error("Erreur API contact:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
