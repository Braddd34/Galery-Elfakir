import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * PUT /api/user/profile-photo
 * Met à jour la photo de profil de l'utilisateur
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { imageUrl } = await req.json()

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "URL de l'image manquante" },
        { status: 400 }
      )
    }

    // Mettre à jour l'image dans la table User
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
      select: {
        id: true,
        image: true,
      },
    })

    return NextResponse.json({
      success: true,
      image: updatedUser.image,
    })
  } catch (error) {
    console.error("Erreur mise à jour photo:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/profile-photo
 * Supprime la photo de profil de l'utilisateur
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Supprimer l'image (mettre à null)
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression photo:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}
