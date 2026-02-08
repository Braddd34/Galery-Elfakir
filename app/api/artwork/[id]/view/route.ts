import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"

// POST - Enregistrer une vue détaillée
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Hash de l'IP pour les visiteurs anonymes
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16)
    
    const userAgent = req.headers.get("user-agent") || null
    const referrer = req.headers.get("referer") || null
    
    // Vérifier que l'œuvre existe
    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id }
    })
    
    if (!artwork) {
      return NextResponse.json(
        { error: "Œuvre non trouvée" },
        { status: 404 }
      )
    }
    
    // Éviter les doublons récents (même utilisateur/IP dans les 30 dernières minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    
    const recentView = await prisma.artworkView.findFirst({
      where: {
        artworkId: params.id,
        viewedAt: { gte: thirtyMinutesAgo },
        OR: [
          { userId: session?.user?.id || undefined },
          { ipHash: !session?.user?.id ? ipHash : undefined }
        ].filter(Boolean)
      }
    })
    
    if (!recentView) {
      // Enregistrer la vue détaillée
      await prisma.artworkView.create({
        data: {
          artworkId: params.id,
          userId: session?.user?.id || null,
          ipHash: !session?.user?.id ? ipHash : null,
          userAgent,
          referrer
        }
      })
      
      // Incrémenter le compteur global
      await prisma.artwork.update({
        where: { id: params.id },
        data: { views: { increment: 1 } }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur enregistrement vue:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// GET - Statistiques des vues pour une œuvre (artiste uniquement)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'œuvre
    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id },
      include: {
        artist: {
          select: { userId: true }
        }
      }
    })
    
    if (!artwork) {
      return NextResponse.json(
        { error: "Œuvre non trouvée" },
        { status: 404 }
      )
    }
    
    if (artwork.artist.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }
    
    // Récupérer les stats des 30 derniers jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const views = await prisma.artworkView.findMany({
      where: {
        artworkId: params.id,
        viewedAt: { gte: thirtyDaysAgo }
      },
      orderBy: { viewedAt: "asc" }
    })
    
    // Grouper par jour
    const viewsByDay: Record<string, number> = {}
    views.forEach(view => {
      const date = view.viewedAt.toISOString().split("T")[0]
      viewsByDay[date] = (viewsByDay[date] || 0) + 1
    })
    
    // Statistiques des référents
    const referrerStats: Record<string, number> = {}
    views.forEach(view => {
      if (view.referrer) {
        try {
          const url = new URL(view.referrer)
          const domain = url.hostname
          referrerStats[domain] = (referrerStats[domain] || 0) + 1
        } catch {
          referrerStats["Direct"] = (referrerStats["Direct"] || 0) + 1
        }
      } else {
        referrerStats["Direct"] = (referrerStats["Direct"] || 0) + 1
      }
    })
    
    return NextResponse.json({
      totalViews: artwork.views,
      last30Days: views.length,
      viewsByDay,
      referrerStats,
      uniqueVisitors: new Set(views.map(v => v.userId || v.ipHash)).size
    })
  } catch (error) {
    console.error("Erreur récupération stats:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
