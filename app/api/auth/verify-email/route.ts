import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token de vérification manquant" },
        { status: 400 }
      )
    }

    // Trouver le token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Lien de vérification invalide ou déjà utilisé" },
        { status: 400 }
      )
    }

    // Vérifier si le token n'est pas expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez vous reconnecter pour recevoir un nouveau lien." },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 400 }
      )
    }

    // Vérifier l'email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })

    // Supprimer le token utilisé
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id }
    })

    return NextResponse.json({ 
      success: true,
      message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter." 
    })
  } catch (error) {
    console.error("Erreur verify-email:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
