import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getManagerArtistIds } from "@/lib/manager-utils"

// PUT: Mettre à jour une œuvre d'un artiste assigné
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    let assignedArtistIds: string[]

    if (session.user.role === "ADMIN") {
      const allArtists = await prisma.artistProfile.findMany({
        select: { id: true }
      })
      assignedArtistIds = allArtists.map(a => a.id)
    } else {
      assignedArtistIds = await getManagerArtistIds(session.user.id)
    }

    // Vérifier que l'œuvre appartient à un artiste assigné
    const existingArtwork = await prisma.artwork.findFirst({
      where: {
        id,
        artistId: { in: assignedArtistIds }
      }
    })

    if (!existingArtwork) {
      return NextResponse.json(
        { error: "Œuvre non trouvée ou non autorisée" },
        { status: 404 }
      )
    }

    if (existingArtwork.status === "SOLD") {
      return NextResponse.json(
        { error: "Cette œuvre a été vendue et ne peut plus être modifiée" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { price, description, status } = body

    const updateData: any = {}

    if (price !== undefined) {
      updateData.price = parseFloat(price)
    }

    if (description !== undefined) {
      const { sanitize } = await import("@/lib/sanitize")
      updateData.description = sanitize(description)
    }

    if (status !== undefined) {
      const allowedStatuses = ["DRAFT", "PENDING", "AVAILABLE", "ARCHIVED"]
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Statut invalide" },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      )
    }

    const artwork = await prisma.artwork.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      artwork,
      message: "Œuvre mise à jour avec succès"
    })
  } catch (error) {
    console.error("Erreur modification œuvre manager:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'œuvre" },
      { status: 500 }
    )
  }
}
