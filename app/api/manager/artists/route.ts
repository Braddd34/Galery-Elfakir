import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getManagerArtistIds } from "@/lib/manager-utils"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
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

    if (assignedArtistIds.length === 0) {
      return NextResponse.json({ artists: [] })
    }

    const artists = await prisma.artistProfile.findMany({
      where: { id: { in: assignedArtistIds } },
      include: {
        user: { select: { name: true, image: true, email: true } },
        artworks: {
          select: {
            id: true,
            status: true,
            views: true,
            createdAt: true,
            orderId: true,
            order: {
              select: { artistPayout: true, status: true }
            }
          }
        }
      }
    })

    const result = artists.map(artist => {
      const allArtworks = artist.artworks
      const soldArtworks = allArtworks.filter(a => a.status === "SOLD")
      const availableArtworks = allArtworks.filter(a => a.status === "AVAILABLE")

      const revenue = soldArtworks.reduce((sum, a) => {
        if (a.order && ["PAID", "SHIPPED", "DELIVERED"].includes(a.order.status)) {
          return sum + Number(a.order.artistPayout)
        }
        return sum
      }, 0)

      const totalViews = allArtworks.reduce((sum, a) => sum + a.views, 0)

      const lastArtworkDate = allArtworks.length > 0
        ? allArtworks.reduce((latest, a) =>
            a.createdAt > latest ? a.createdAt : latest,
            allArtworks[0].createdAt
          )
        : null

      return {
        id: artist.id,
        userId: artist.userId,
        name: artist.user.name || artist.user.email,
        image: artist.user.image,
        artworkCount: allArtworks.length,
        soldCount: soldArtworks.length,
        availableCount: availableArtworks.length,
        revenue,
        totalViews,
        lastArtworkDate,
      }
    })

    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))

    return NextResponse.json({ artists: result })
  } catch (error) {
    console.error("Erreur récupération artistes manager:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
