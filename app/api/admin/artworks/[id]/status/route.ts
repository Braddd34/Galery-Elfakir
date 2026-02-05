import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// PATCH: Changer le statut d'une œuvre rapidement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { status } = await request.json()

    // Valider le statut
    const validStatuses = ["DRAFT", "PENDING", "AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Mettre à jour le statut
    const artwork = await prisma.artwork.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({ 
      success: true, 
      artwork,
      message: `Statut mis à jour: ${status}`
    })

  } catch (error) {
    console.error("Erreur changement statut:", error)
    return NextResponse.json({ error: "Erreur lors du changement de statut" }, { status: 500 })
  }
}
