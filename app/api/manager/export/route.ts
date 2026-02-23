import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getManagerArtistIds } from "@/lib/manager-utils"

export const dynamic = "force-dynamic"

// GET - Exporter les données en CSV pour le manager
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
      return NextResponse.json(
        { error: "Aucun artiste assigné" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "artworks"
    const artistIdFilter = searchParams.get("artistId") || ""

    // Si un filtre artiste est fourni, vérifier qu'il est dans les assignés
    const filterArtistIds = artistIdFilter && assignedArtistIds.includes(artistIdFilter)
      ? [artistIdFilter]
      : assignedArtistIds

    // BOM UTF-8 pour que Excel interprète correctement les accents
    const BOM = "\uFEFF"

    if (type === "artworks") {
      const artworks = await prisma.artwork.findMany({
        where: { artistId: { in: filterArtistIds } },
        include: {
          artist: {
            select: { user: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: "desc" }
      })

      const headers = [
        "Title",
        "Artist",
        "Category",
        "Year",
        "Dimensions",
        "Price",
        "Status",
        "Views",
        "Created"
      ]

      const rows = artworks.map(a => [
        a.title,
        a.artist?.user?.name || "Inconnu",
        a.category,
        a.year,
        `${a.width}x${a.height}${a.depth ? `x${a.depth}` : ""}`,
        Number(a.price).toFixed(2),
        a.status,
        a.views,
        a.createdAt.toISOString().split("T")[0]
      ])

      const csv = BOM + [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="artworks_${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    } else if (type === "sales") {
      const orders = await prisma.order.findMany({
        where: {
          artwork: { artistId: { in: filterArtistIds } },
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] }
        },
        include: {
          user: { select: { name: true, email: true } },
          artwork: {
            select: {
              title: true,
              artist: { select: { user: { select: { name: true } } } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })

      const headers = [
        "OrderNumber",
        "Date",
        "Artwork",
        "Artist",
        "Buyer",
        "Total",
        "Commission",
        "ArtistPayout",
        "Status"
      ]

      const rows = orders.map(o => {
        const snapshot = o.artworkSnapshot as any
        return [
          o.orderNumber,
          (o.paidAt || o.createdAt).toISOString().split("T")[0],
          o.artwork?.title || snapshot?.title || "N/A",
          o.artwork?.artist?.user?.name || "Inconnu",
          o.user?.name || o.user?.email || "Inconnu",
          Number(o.total).toFixed(2),
          Number(o.commissionAmount).toFixed(2),
          Number(o.artistPayout).toFixed(2),
          o.status
        ]
      })

      const csv = BOM + [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sales_${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    }

    return NextResponse.json(
      { error: "Type d'export invalide. Utilisez 'artworks' ou 'sales'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Erreur export manager:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
