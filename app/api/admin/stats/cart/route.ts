import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalAdds, totalCheckouts] = await Promise.all([
      prisma.cartEvent.count({
        where: { action: "add", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.cartEvent.count({
        where: { action: "checkout", createdAt: { gte: thirtyDaysAgo } },
      }),
    ])

    const abandonmentRate =
      totalAdds > 0
        ? Math.round(((totalAdds - totalCheckouts) / totalAdds) * 100)
        : 0

    // Top 5 des œuvres les plus abandonnées :
    // ajoutées au panier mais jamais checkoutées (sur 30 jours)
    const addsByArtwork = await prisma.cartEvent.groupBy({
      by: ["artworkId"],
      where: { action: "add", createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    })

    const checkoutsByArtwork = await prisma.cartEvent.groupBy({
      by: ["artworkId"],
      where: { action: "checkout", createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    })

    const checkoutsMap = new Map(
      checkoutsByArtwork.map((c) => [c.artworkId, c._count.id])
    )

    const abandonedArtworkIds = addsByArtwork
      .map((a) => ({
        artworkId: a.artworkId,
        adds: a._count.id,
        checkouts: checkoutsMap.get(a.artworkId) || 0,
      }))
      .filter((a) => a.adds > a.checkouts)
      .sort((a, b) => b.adds - b.checkouts - (a.adds - a.checkouts))
      .slice(0, 5)

    const artworkDetails = await prisma.artwork.findMany({
      where: { id: { in: abandonedArtworkIds.map((a) => a.artworkId) } },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        price: true,
        artist: {
          select: { user: { select: { name: true } } },
        },
      },
    })

    const artworkMap = new Map(artworkDetails.map((a) => [a.id, a]))

    const topAbandoned = abandonedArtworkIds.map((a) => {
      const artwork = artworkMap.get(a.artworkId)
      return {
        artworkId: a.artworkId,
        title: artwork?.title || "Œuvre supprimée",
        slug: artwork?.slug || "",
        image: getImageUrl(artwork?.images),
        price: artwork ? Number(artwork.price) : 0,
        artistName: artwork?.artist?.user?.name || "Inconnu",
        adds: a.adds,
        checkouts: a.checkouts,
      }
    })

    // Paniers abandonnés récents (7 jours) :
    // utilisateurs ayant ajouté des articles sans checkout
    const recentAdds = await prisma.cartEvent.findMany({
      where: { action: "add", createdAt: { gte: sevenDaysAgo } },
      select: {
        userId: true,
        sessionId: true,
        artworkId: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        artwork: {
          select: { title: true, slug: true, images: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const recentCheckoutKeys = new Set(
      (
        await prisma.cartEvent.findMany({
          where: { action: "checkout", createdAt: { gte: sevenDaysAgo } },
          select: { userId: true, sessionId: true, artworkId: true },
        })
      ).map(
        (c) => `${c.userId || c.sessionId}-${c.artworkId}`
      )
    )

    // Grouper par userId ou sessionId
    const abandonedCartsMap = new Map<
      string,
      {
        identifier: string
        userName: string | null
        userEmail: string | null
        items: {
          artworkId: string
          title: string
          slug: string
          image: string
          price: number
          addedAt: Date
        }[]
      }
    >()

    for (const add of recentAdds) {
      const key = `${add.userId || add.sessionId}-${add.artworkId}`
      if (recentCheckoutKeys.has(key)) continue

      const groupKey = add.userId || add.sessionId || "unknown"

      if (!abandonedCartsMap.has(groupKey)) {
        abandonedCartsMap.set(groupKey, {
          identifier: groupKey,
          userName: add.user?.name || null,
          userEmail: add.user?.email || null,
          items: [],
        })
      }

      const cart = abandonedCartsMap.get(groupKey)!
      if (!cart.items.some((i) => i.artworkId === add.artworkId)) {
        cart.items.push({
          artworkId: add.artworkId,
          title: add.artwork?.title || "Œuvre supprimée",
          slug: add.artwork?.slug || "",
          image: getImageUrl(add.artwork?.images),
          price: add.artwork ? Number(add.artwork.price) : 0,
          addedAt: add.createdAt,
        })
      }
    }

    const recentAbandonedCarts = Array.from(abandonedCartsMap.values())
      .sort((a, b) => {
        const aDate = a.items[0]?.addedAt || new Date(0)
        const bDate = b.items[0]?.addedAt || new Date(0)
        return bDate.getTime() - aDate.getTime()
      })
      .slice(0, 10)

    return NextResponse.json({
      totalAdds,
      totalCheckouts,
      abandonmentRate,
      topAbandoned,
      recentAbandonedCarts,
    })
  } catch (error) {
    console.error("Erreur stats cart:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

function getImageUrl(images: unknown): string {
  const fallback = ""
  if (!images) return fallback
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}
