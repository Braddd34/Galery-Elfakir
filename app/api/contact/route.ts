import { NextRequest, NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/emails"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
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
