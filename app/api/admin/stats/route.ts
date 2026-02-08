import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Statistiques admin complètes avec graphiques
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
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    
    // Stats globales
    const [
      totalUsers,
      totalArtists,
      totalBuyers,
      totalArtworks,
      availableArtworks,
      soldArtworks,
      totalOrders,
      revenueData,
      newUsersThisMonth,
      newArtworksThisMonth,
      pendingArtworks,
      pendingArtists,
      recentOrders,
      recentViews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ARTIST" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.artwork.count(),
      prisma.artwork.count({ where: { status: "AVAILABLE" } }),
      prisma.artwork.count({ where: { status: "SOLD" } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true }
      }),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.artwork.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.artwork.count({ where: { status: "PENDING" } }),
      prisma.user.count({
        where: { role: "ARTIST", status: "PENDING" }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: {
          total: true,
          createdAt: true,
          paidAt: true,
          status: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.artworkView.findMany({
        where: { viewedAt: { gte: thirtyDaysAgo } },
        select: { viewedAt: true }
      })
    ])
    
    // Inscriptions par mois (6 derniers mois)
    const registrationsByMonth: Record<string, number> = {}
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return d.toISOString().substring(0, 7)
    })
    
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    })
    
    recentUsers.forEach(user => {
      const month = user.createdAt.toISOString().substring(0, 7)
      registrationsByMonth[month] = (registrationsByMonth[month] || 0) + 1
    })
    
    // Revenus par mois
    const revenueByMonth: Record<string, number> = {}
    recentOrders.forEach(order => {
      if (order.paidAt || ["PAID", "SHIPPED", "DELIVERED"].includes(order.status)) {
        const date = order.paidAt || order.createdAt
        const month = date.toISOString().substring(0, 7)
        revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(order.total)
      }
    })
    
    // Vues par jour (30 jours)
    const viewsByDay: Record<string, number> = {}
    recentViews.forEach(view => {
      const day = view.viewedAt.toISOString().split("T")[0]
      viewsByDay[day] = (viewsByDay[day] || 0) + 1
    })
    
    // Alertes
    const alerts: { type: string; message: string; count: number; link: string }[] = []
    
    if (pendingArtworks > 0) {
      alerts.push({
        type: "warning",
        message: `${pendingArtworks} œuvre${pendingArtworks > 1 ? "s" : ""} en attente de validation`,
        count: pendingArtworks,
        link: "/admin/oeuvres"
      })
    }
    
    if (pendingArtists > 0) {
      alerts.push({
        type: "warning",
        message: `${pendingArtists} artiste${pendingArtists > 1 ? "s" : ""} en attente d'approbation`,
        count: pendingArtists,
        link: "/admin/artistes"
      })
    }
    
    // Commandes non traitées
    const unprocessedOrders = await prisma.order.count({
      where: { status: "PAID" }
    })
    
    if (unprocessedOrders > 0) {
      alerts.push({
        type: "urgent",
        message: `${unprocessedOrders} commande${unprocessedOrders > 1 ? "s" : ""} payée${unprocessedOrders > 1 ? "s" : ""} non expédiée${unprocessedOrders > 1 ? "s" : ""}`,
        count: unprocessedOrders,
        link: "/admin/commandes"
      })
    }
    
    // Messages non lus de contact
    const unreadMessages = await prisma.message.count({
      where: { read: false }
    })
    
    if (unreadMessages > 5) {
      alerts.push({
        type: "info",
        message: `${unreadMessages} messages non lus sur la plateforme`,
        count: unreadMessages,
        link: "/dashboard/messages"
      })
    }
    
    return NextResponse.json({
      stats: {
        totalUsers,
        totalArtists,
        totalBuyers,
        totalArtworks,
        availableArtworks,
        soldArtworks,
        totalOrders,
        totalRevenue: Number(revenueData._sum.total || 0),
        newUsersThisMonth,
        newArtworksThisMonth
      },
      charts: {
        registrationsByMonth,
        revenueByMonth,
        viewsByDay,
        months: last6Months
      },
      alerts
    })
  } catch (error) {
    console.error("Erreur stats admin:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
