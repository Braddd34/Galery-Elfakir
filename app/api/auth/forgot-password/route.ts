import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/emails"
import crypto from "crypto"
import { authLimiter, getClientIP } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    // Rate limiting : max 3 demandes de reset par minute par IP
    const ip = getClientIP(req)
    const { success } = await authLimiter.check(`reset-${ip}`, 3)
    if (!success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans une minute." },
        { status: 429 }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // On renvoie toujours un succès pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({ 
        success: true,
        message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation." 
      })
    }

    // Supprimer les anciens tokens de cet email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() }
    })

    // Créer un nouveau token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 heure

    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires
      }
    })

    // Construire l'URL de réinitialisation
    const baseUrl = process.env.NEXTAUTH_URL || "https://galeryelfakir.vercel.app"
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Envoyer l'email
    await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json({ 
      success: true,
      message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation." 
    })
  } catch (error) {
    console.error("Erreur forgot-password:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
