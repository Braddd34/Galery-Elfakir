import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

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
