import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const defaultPreferences = {
  notifyNewArtworks: true,
  notifyPriceDrops: true,
  notifyArtistNews: false,
  notifyNewsletter: true,
  notifyOrderUpdates: true,
}

/**
 * GET /api/user/notifications
 * Récupère les préférences de notification de l'utilisateur
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Récupérer le profil acheteur avec les préférences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        buyerProfile: {
          select: {
            notifyNewArtworks: true,
            notifyPriceDrops: true,
            notifyArtistNews: true,
            notifyNewsletter: true,
            notifyOrderUpdates: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Si pas de profil acheteur, retourner les valeurs par défaut
    const preferences = user.buyerProfile || defaultPreferences

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Erreur récupération préférences:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/notifications
 * Met à jour les préférences de notification
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

    const body = await req.json()

    // Filtrer uniquement les champs de notification valides
    const validFields = [
      "notifyNewArtworks",
      "notifyPriceDrops",
      "notifyArtistNews",
      "notifyNewsletter",
      "notifyOrderUpdates",
    ]

    const updateData: Record<string, boolean> = {}
    for (const field of validFields) {
      if (typeof body[field] === "boolean") {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune préférence valide à mettre à jour" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Mettre à jour ou créer le profil acheteur avec les préférences
    const updatedProfile = await prisma.buyerProfile.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...defaultPreferences,
        ...updateData,
      },
      select: {
        notifyNewArtworks: true,
        notifyPriceDrops: true,
        notifyArtistNews: true,
        notifyNewsletter: true,
        notifyOrderUpdates: true,
      },
    })

    return NextResponse.json({
      success: true,
      preferences: updatedProfile,
    })
  } catch (error) {
    console.error("Erreur mise à jour préférences:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
