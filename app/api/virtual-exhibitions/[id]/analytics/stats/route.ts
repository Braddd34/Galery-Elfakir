import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function canAccessStats(
  exhibitionId: string,
  userId: string,
  userRole: string
): Promise<boolean> {
  if (userRole === "ADMIN") return true

  const exhibition = await prisma.virtualExhibition.findUnique({
    where: { id: exhibitionId },
    include: {
      artworks: { include: { artwork: { select: { artistId: true } } } },
    },
  })
  if (!exhibition) return false
  if (exhibition.createdById === userId) return true

  if (userRole === "MANAGER") {
    const artistIds = exhibition.artworks.map((ea) => ea.artwork.artistId)
    if (artistIds.length === 0) return false
    const assignment = await prisma.artistAssignment.findFirst({
      where: {
        managerId: userId,
        artistId: { in: artistIds },
      },
    })
    return !!assignment
  }

  return false
}

function getDateFromPeriod(period: string): Date | null {
  const now = new Date()
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case "all":
      return null
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: exhibitionId } = params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== "ADMIN" && role !== "MANAGER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const allowed = await canAccessStats(
      exhibitionId,
      session.user.id,
      role
    )
    if (!allowed) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "30d"
    const fromDate = getDateFromPeriod(period)

    const whereClause = {
      exhibitionId,
      ...(fromDate && { enteredAt: { gte: fromDate } }),
    }

    const records = await prisma.exhibitionAnalytics.findMany({
      where: whereClause,
    })

    const totalVisits = records.length
    const uniqueSessionIds = new Set(records.map((r) => r.sessionId))
    const uniqueVisitors = uniqueSessionIds.size

    const durations = records.map((r) => r.duration).filter((d): d is number => d != null)
    const avgDuration =
      durations.length > 0
        ? Math.round(
            durations.reduce((a, b) => a + b, 0) / durations.length
          )
        : 0

    const artworkClickMap = new Map<string, number>()
    let totalArtworkClicks = 0
    for (const r of records) {
      const clicks = r.artworkClicks as Array<{ artworkId?: string }> | null
      if (Array.isArray(clicks)) {
        for (const c of clicks) {
          const aid = c?.artworkId
          if (aid) {
            artworkClickMap.set(aid, (artworkClickMap.get(aid) ?? 0) + 1)
            totalArtworkClicks++
          }
        }
      }
    }

    const topArtworkIds = Array.from(artworkClickMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id)

    const artworks =
      topArtworkIds.length > 0
        ? await prisma.artwork.findMany({
            where: { id: { in: topArtworkIds } },
            select: { id: true, title: true },
          })
        : []
    const artworkById = Object.fromEntries(artworks.map((a) => [a.id, a]))
    const topArtworks = topArtworkIds.map((id) => ({
      id,
      title: artworkById[id]?.title ?? "Inconnu",
      clickCount: artworkClickMap.get(id) ?? 0,
    }))

    const deviceBreakdown = {
      desktop: records.filter((r) => r.device === "desktop").length,
      mobile: records.filter((r) => r.device === "mobile").length,
      tablet: records.filter((r) => r.device === "tablet").length,
    }

    const visitsByDayMap = new Map<string, number>()
    for (const r of records) {
      const d = r.enteredAt.toISOString().slice(0, 10)
      visitsByDayMap.set(d, (visitsByDayMap.get(d) ?? 0) + 1)
    }
    const visitsByDay = Array.from(visitsByDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const visitsWithArtworkClicks = records.filter((r) => {
      const clicks = r.artworkClicks as Array<unknown> | null
      return Array.isArray(clicks) && clicks.length > 0
    }).length

    const visitsWithCartAdds = records.filter((r) => {
      const adds = r.cartAdds as Array<unknown> | null
      return Array.isArray(adds) && adds.length > 0
    }).length

    const exhibitionArtworkIds = (
      await prisma.virtualExhibitionArtwork.findMany({
        where: { exhibitionId },
        select: { artworkId: true },
      })
    ).map((ea) => ea.artworkId)

    const sales =
      exhibitionArtworkIds.length > 0
        ? await prisma.order.count({
            where: {
              artwork: { id: { in: exhibitionArtworkIds } },
              status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
              ...(fromDate && { createdAt: { gte: fromDate } }),
            },
          })
        : 0

    const conversionFunnel = {
      visits: totalVisits,
      artworkClicks: visitsWithArtworkClicks,
      cartAdds: visitsWithCartAdds,
      sales,
    }

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      avgDuration,
      totalArtworkClicks,
      topArtworks,
      deviceBreakdown,
      visitsByDay,
      conversionFunnel,
    })
  } catch (error) {
    console.error(
      "Erreur GET /api/virtual-exhibitions/[id]/analytics/stats:",
      error
    )
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
