import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * API pour gérer les notifications de l'utilisateur connecté.
 * 
 * GET : Récupérer les notifications (avec compteur non lues)
 * PUT : Marquer une ou toutes les notifications comme lues
 */

export const dynamic = "force-dynamic"

// GET : Récupérer les notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // Compteur de notifications non lues
    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false }
    })

    // Récupérer les notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {})
      },
      orderBy: { createdAt: "desc" },
      take: limit
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })

  } catch (error) {
    console.error("Erreur récupération notifications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT : Marquer comme lu
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id, markAll } = await req.json()

    if (markAll) {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true, readAt: new Date() }
      })
    } else if (id) {
      // Marquer une notification spécifique comme lue
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { read: true, readAt: new Date() }
      })
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false }
    })

    return NextResponse.json({ success: true, unreadCount })

  } catch (error) {
    console.error("Erreur notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
