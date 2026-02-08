import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Récupérer les statistiques complètes de l'artiste
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    // Récupérer le profil artiste
    const artist = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!artist) {
      return NextResponse.json(
        { error: "Profil artiste non trouvé" },
        { status: 404 }
      )
    }
    
    // Périodes
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    
    // Récupérer toutes les œuvres de l'artiste
    const artworks = await prisma.artwork.findMany({
      where: { artistId: artist.id },
      select: {
        id: true,
        title: true,
        views: true,
        status: true,
        price: true,
        createdAt: true,
        soldAt: true
      }
    })
    
    // Récupérer les vues des 30 derniers jours
    const recentViews = await prisma.artworkView.findMany({
      where: {
        artwork: { artistId: artist.id },
        viewedAt: { gte: thirtyDaysAgo }
      },
      select: {
        viewedAt: true,
        artworkId: true
      }
    })
    
    // Récupérer les commandes/ventes
    const orders = await prisma.order.findMany({
      where: {
        artwork: { artistId: artist.id },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] }
      },
      select: {
        id: true,
        total: true,
        artistPayout: true,
        createdAt: true,
        paidAt: true,
        artworkSnapshot: true
      },
      orderBy: { createdAt: "asc" }
    })
    
    // Récupérer les followers
    const followersCount = await prisma.follow.count({
      where: { artistId: artist.id }
    })
    
    // Nouveaux followers ce mois
    const newFollowersThisMonth = await prisma.follow.count({
      where: {
        artistId: artist.id,
        createdAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Statistiques par jour (vues)
    const viewsByDay: Record<string, number> = {}
    recentViews.forEach(view => {
      const date = view.viewedAt.toISOString().split("T")[0]
      viewsByDay[date] = (viewsByDay[date] || 0) + 1
    })
    
    // Statistiques par mois (ventes)
    const salesByMonth: Record<string, { count: number; revenue: number }> = {}
    orders.forEach(order => {
      const date = order.paidAt || order.createdAt
      const month = date.toISOString().substring(0, 7) // YYYY-MM
      if (!salesByMonth[month]) {
        salesByMonth[month] = { count: 0, revenue: 0 }
      }
      salesByMonth[month].count++
      salesByMonth[month].revenue += Number(order.artistPayout)
    })
    
    // Top œuvres par vues
    const topArtworksByViews = artworks
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        title: a.title,
        views: a.views
      }))
    
    // Statistiques globales
    const stats = {
      // Résumé
      totalArtworks: artworks.length,
      availableArtworks: artworks.filter(a => a.status === "AVAILABLE").length,
      soldArtworks: artworks.filter(a => a.status === "SOLD").length,
      
      // Vues
      totalViews: artworks.reduce((sum, a) => sum + a.views, 0),
      viewsLast30Days: recentViews.length,
      viewsByDay,
      
      // Ventes
      totalSales: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.artistPayout), 0),
      salesByMonth,
      
      // Followers
      followersCount,
      newFollowersThisMonth,
      
      // Top œuvres
      topArtworksByViews,
      
      // Taux de conversion (vues -> ventes)
      conversionRate: artworks.reduce((sum, a) => sum + a.views, 0) > 0
        ? (orders.length / artworks.reduce((sum, a) => sum + a.views, 0) * 100).toFixed(2)
        : "0.00"
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erreur récupération stats artiste:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
