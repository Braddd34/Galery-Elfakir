import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitize } from "@/lib/sanitize"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await params

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 })
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const rating = body.rating
    const title = sanitize(body.title || "")
    const comment = sanitize(body.comment || "")

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating,
        title: title || null,
        comment: comment || null,
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erreur modification avis:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await params

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 })
    }

    const isOwner = review.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    await prisma.review.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression avis:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
