import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notifyNewReview } from "@/lib/notifications"

// GET - Récupérer les avis d'une œuvre
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const artworkId = searchParams.get("artworkId")
    
    if (!artworkId) {
      return NextResponse.json(
        { error: "artworkId requis" },
        { status: 400 }
      )
    }
    
    const reviews = await prisma.review.findMany({
      where: { artworkId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    // Calculer la moyenne des notes
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0
    
    return NextResponse.json({
      reviews,
      stats: {
        count: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10
      }
    })
  } catch (error) {
    console.error("Erreur récupération avis:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Créer un avis
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const { artworkId, rating, title, comment } = await req.json()
    
    if (!artworkId || !rating) {
      return NextResponse.json(
        { error: "artworkId et rating requis" },
        { status: 400 }
      )
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      )
    }
    
    // Vérifier si l'utilisateur a déjà noté cette œuvre
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_artworkId: {
          userId: session.user.id,
          artworkId
        }
      }
    })
    
    if (existingReview) {
      return NextResponse.json(
        { error: "Vous avez déjà noté cette œuvre" },
        { status: 400 }
      )
    }
    
    // Vérifier si l'utilisateur a acheté l'œuvre (achat vérifié)
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        artwork: { id: artworkId },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] }
      }
    })
    
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        artworkId,
        rating,
        title: title || null,
        comment: comment || null,
        verified: !!order
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    // Notifier l'artiste de la nouvelle critique
    try {
      const artwork = await prisma.artwork.findUnique({
        where: { id: artworkId },
        include: {
          artist: {
            select: { userId: true }
          }
        }
      })
      if (artwork?.artist?.userId) {
        notifyNewReview(artwork.artist.userId, artwork.title, rating)
          .catch(err => console.error("Erreur notification review:", err))
      }
    } catch {}
    
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Erreur création avis:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
