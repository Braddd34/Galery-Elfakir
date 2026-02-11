import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { authLimiter, getClientIP } from "@/lib/rate-limit"
import { resetPasswordSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    // Rate limiting — empêche le spam de reset
    const ip = getClientIP(req)
    const rateLimitResult = await authLimiter.check(ip, 5)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token requis" },
        { status: 400 }
      )
    }

    // Validation Zod sur le mot de passe (min 8 chars, majuscule, chiffre)
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const { password } = validation.data

    // Trouver le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré" },
        { status: 400 }
      )
    }

    // Vérifier si le token n'est pas expiré
    if (resetToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez demander un nouveau lien de réinitialisation." },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })

    return NextResponse.json({ 
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès" 
    })
  } catch (error) {
    console.error("Erreur reset-password:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
