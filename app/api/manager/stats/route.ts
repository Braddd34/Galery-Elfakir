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

    // Pour un ADMIN, on récupère tous les profils artistes ; pour un MANAGER, seulement les assignés
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
      return NextResponse.json({
        totalArtists: 0,
        totalArtworks: 0,
        availableArtworks: 0,
        soldArtworks: 0,
        totalRevenue: 0,
        totalCommission: 0,
        totalViews: 0,
        cartAbandonment: 0,
        topArtists: [],
        topArtworks: [],
        recentSales: [],
        stagnantArtworks: [],
        salesByMonth: [],
      })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

    // Toutes les œuvres des artistes assignés
    const artworks = await prisma.artwork.findMany({
      where: { artistId: { in: assignedArtistIds } },
      select: {
        id: true,
        title: true,
        views: true,
        status: true,
        price: true,
        createdAt: true,
        artistId: true,
        artist: {
          select: { user: { select: { name: true } } }
        }
      }
    })

    const totalArtists = assignedArtistIds.length
    const totalArtworks = artworks.length
    const availableArtworks = artworks.filter(a => a.status === "AVAILABLE").length
    const soldArtworks = artworks.filter(a => a.status === "SOLD").length

    // Commandes des artistes assignés (payées, expédiées, livrées)
    const orders = await prisma.order.findMany({
      where: {
        artwork: { artistId: { in: assignedArtistIds } },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] }
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        artistPayout: true,
        commissionAmount: true,
        createdAt: true,
        paidAt: true,
        status: true,
        artworkSnapshot: true,
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

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.artistPayout), 0)
    const totalCommission = orders.reduce((sum, o) => sum + Number(o.commissionAmount), 0)

    // Vues des 30 derniers jours
    const recentViewsCount = await prisma.artworkView.count({
      where: {
        artwork: { artistId: { in: assignedArtistIds } },
        viewedAt: { gte: thirtyDaysAgo }
      }
    })

    // Abandon de panier : ajouts vs checkouts sur les 30 derniers jours
    const cartAdds = await prisma.cartEvent.count({
      where: {
        artwork: { artistId: { in: assignedArtistIds } },
        action: "add",
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const cartCheckouts = await prisma.cartEvent.count({
      where: {
        artwork: { artistId: { in: assignedArtistIds } },
        action: "checkout",
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const cartAbandonment = cartAdds > 0
      ? Math.round(((cartAdds - cartCheckouts) / cartAdds) * 100)
      : 0

    // Top 5 artistes par revenu
    const revenueByArtist: Record<string, { name: string; soldCount: number; revenue: number }> = {}
    for (const order of orders) {
      const artistName = order.artwork?.artist?.user?.name || "Inconnu"
      const snapshot = order.artworkSnapshot as any
      const artistId = snapshot?.artistId || "unknown"
      if (!revenueByArtist[artistId]) {
        revenueByArtist[artistId] = { name: artistName, soldCount: 0, revenue: 0 }
      }
      revenueByArtist[artistId].soldCount++
      revenueByArtist[artistId].revenue += Number(order.artistPayout)
    }

    const topArtists = Object.values(revenueByArtist)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Top 5 œuvres par vues
    const topArtworks = artworks
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        title: a.title,
        views: a.views,
        artistName: a.artist?.user?.name || "Inconnu"
      }))

    // 5 dernières ventes
    const recentSales = orders.slice(0, 5).map(o => {
      const snapshot = o.artworkSnapshot as any
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        artworkTitle: o.artwork?.title || snapshot?.title || "N/A",
        artistName: o.artwork?.artist?.user?.name || "Inconnu",
        buyerName: o.user?.name || o.user?.email || "Inconnu",
        total: Number(o.total),
        commission: Number(o.commissionAmount),
        artistPayout: Number(o.artistPayout),
        status: o.status,
        date: o.paidAt || o.createdAt
      }
    })

    // Œuvres stagnantes : AVAILABLE sans vues depuis 30+ jours
    const artworkIds = artworks
      .filter(a => a.status === "AVAILABLE")
      .map(a => a.id)

    let stagnantArtworks: { id: string; title: string; artistName: string; lastViewDate: Date | null }[] = []

    if (artworkIds.length > 0) {
      const recentViewedArtworkIds = await prisma.artworkView.findMany({
        where: {
          artworkId: { in: artworkIds },
          viewedAt: { gte: thirtyDaysAgo }
        },
        select: { artworkId: true },
        distinct: ["artworkId"]
      })

      const recentlyViewedSet = new Set(recentViewedArtworkIds.map(v => v.artworkId))

      stagnantArtworks = artworks
        .filter(a => a.status === "AVAILABLE" && !recentlyViewedSet.has(a.id))
        .map(a => ({
          id: a.id,
          title: a.title,
          artistName: a.artist?.user?.name || "Inconnu",
          lastViewDate: null
        }))
    }

    // Ventes par mois (6 derniers mois)
    const salesByMonthMap: Record<string, { count: number; revenue: number; commission: number }> = {}

    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().substring(0, 7)
      salesByMonthMap[key] = { count: 0, revenue: 0, commission: 0 }
    }

    for (const order of orders) {
      const date = order.paidAt || order.createdAt
      if (date >= sixMonthsAgo) {
        const key = date.toISOString().substring(0, 7)
        if (salesByMonthMap[key]) {
          salesByMonthMap[key].count++
          salesByMonthMap[key].revenue += Number(order.artistPayout)
          salesByMonthMap[key].commission += Number(order.commissionAmount)
        }
      }
    }

    const salesByMonth = Object.entries(salesByMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }))

    return NextResponse.json({
      totalArtists,
      totalArtworks,
      availableArtworks,
      soldArtworks,
      totalRevenue,
      totalCommission,
      totalViews: recentViewsCount,
      cartAbandonment,
      topArtists,
      topArtworks,
      recentSales,
      stagnantArtworks,
      salesByMonth,
    })
  } catch (error) {
    console.error("Erreur récupération stats manager:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
