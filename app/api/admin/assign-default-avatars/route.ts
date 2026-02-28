import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const DEFAULT_AVATAR_URL = "https://galeryelfakir.vercel.app/avatar-placeholder.svg"

/**
 * POST /api/admin/assign-default-avatars
 * Attribue la photo par défaut (avatar placeholder) à tous les artistes qui n'ont pas de photo.
 * Réservé aux admins. À appeler une fois ou après ajout d'artistes sans photo.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const result = await prisma.user.updateMany({
      where: {
        role: "ARTIST",
        image: null,
      },
      data: {
        image: DEFAULT_AVATAR_URL,
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} artiste(s) sans photo ont reçu l'avatar par défaut.`,
    })
  } catch (error) {
    console.error("Erreur assign-default-avatars:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'attribution des avatars" },
      { status: 500 }
    )
  }
}
