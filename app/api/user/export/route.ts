import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { formLimiter, getClientIP } from "@/lib/rate-limit"

/**
 * GET /api/user/export
 * Export RGPD : retourne toutes les donnees personnelles de l'utilisateur connecte
 * en JSON telechargeable.
 *
 * Rate limit : max 2 exports par minute par utilisateur (fait 8 grosses
 * requêtes Prisma en parallèle, donc coûteux en DB).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id

    const ip = getClientIP(req)
    const limited = await formLimiter.check(`export:${userId}:${ip}`, 2)
    if (!limited.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une minute." },
        { status: 429 }
      )
    }

    const [user, buyerProfile, orders, reviews, favorites, follows, messages, cartEvents] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        }
      }),
      prisma.buyerProfile.findUnique({
        where: { userId },
        select: {
          firstName: true,
          lastName: true,
          address: true,
          city: true,
          postalCode: true,
          country: true,
          phone: true,
        }
      }),
      prisma.order.findMany({
        where: { userId },
        select: {
          orderNumber: true,
          artworkSnapshot: true,
          subtotal: true,
          shippingCost: true,
          total: true,
          status: true,
          shippingAddress: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.review.findMany({
        where: { userId },
        select: {
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          artwork: { select: { title: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.favorite.findMany({
        where: { userId },
        select: {
          createdAt: true,
          artwork: { select: { title: true, slug: true } }
        }
      }),
      prisma.follow.findMany({
        where: { userId },
        select: {
          createdAt: true,
          artist: {
            select: {
              user: { select: { name: true } }
            }
          }
        }
      }),
      prisma.message.findMany({
        where: { senderId: userId },
        select: {
          content: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.cartEvent.findMany({
        where: { userId },
        select: {
          action: true,
          createdAt: true,
          artwork: { select: { title: true } }
        },
        orderBy: { createdAt: "desc" }
      })
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      account: user,
      profile: buyerProfile,
      orders: orders.map(o => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        total: Number(o.total),
      })),
      reviews: reviews.map(r => ({
        artwork: r.artwork?.title || "Œuvre supprimée",
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: r.createdAt,
      })),
      favorites: favorites.map(f => ({
        artwork: f.artwork?.title || "Œuvre supprimée",
        slug: f.artwork?.slug || "",
        date: f.createdAt,
      })),
      followedArtists: follows.map(f => ({
        artist: f.artist?.user?.name || "Artiste",
        date: f.createdAt,
      })),
      messages: messages.map(m => ({
        content: m.content,
        date: m.createdAt,
      })),
      cartEvents: cartEvents.map(e => ({
        artwork: e.artwork?.title || "Œuvre supprimée",
        action: e.action,
        date: e.createdAt,
      })),
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mes-donnees-elfakir-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Erreur export RGPD:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
