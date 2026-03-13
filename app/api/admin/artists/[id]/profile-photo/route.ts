import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { cleanupProfilePhoto } from "@/lib/s3"
import { logAudit } from "@/lib/audit"

/**
 * PUT /api/admin/artists/[id]/profile-photo
 * Permet à l'admin de changer la photo de profil d'un artiste (user id).
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const { imageUrl } = await request.json()
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "URL de l'image manquante" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }
    if (user.role !== "ARTIST") {
      return NextResponse.json(
        { error: "Seul un compte artiste peut avoir sa photo modifiée ici" },
        { status: 400 }
      )
    }

    // Supprimer l'ancienne photo S3 si elle existe
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true }
    })
    if (currentUser?.image) {
      await cleanupProfilePhoto(currentUser.image)
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    })

    await logAudit({
      userId: session.user.id,
      action: "update_artist_photo",
      target: userId
    })

    return NextResponse.json({ success: true, image: imageUrl })
  } catch (error) {
    console.error("Erreur admin profile-photo:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}
