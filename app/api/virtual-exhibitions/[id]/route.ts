import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function canAccessPrivateExhibition(
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id },
      include: {
        artworks: {
          orderBy: { displayOrder: "asc" },
          include: {
            artwork: {
              select: {
                id: true,
                title: true,
                images: true,
                price: true,
                slug: true,
                width: true,
                height: true,
                artist: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    if (exhibition.status !== "PUBLISHED") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
      }
      const allowed = await canAccessPrivateExhibition(
        id,
        session.user.id,
        session.user.role as string
      )
      if (!allowed) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
      }
    }

    if (exhibition.status === "PUBLISHED") {
      await prisma.virtualExhibition.update({
        where: { id },
        data: { views: { increment: 1 } },
      })
      exhibition.views += 1
    }

    const formatted = {
      ...exhibition,
      artworks: exhibition.artworks.map((ea) => ({
        wall: ea.wall,
        positionX: ea.positionX,
        positionY: ea.positionY,
        scale: ea.scale,
        displayOrder: ea.displayOrder,
        artwork: {
          id: ea.artwork.id,
          title: ea.artwork.title,
          images: ea.artwork.images,
          price: ea.artwork.price,
          slug: ea.artwork.slug,
          width: ea.artwork.width,
          height: ea.artwork.height,
          artist: { name: ea.artwork.artist.user.name },
        },
      })),
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Erreur GET /api/virtual-exhibitions/[id]:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({ where: { id } })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isCreator = exhibition.createdById === session.user.id
    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      theme,
      coverImage,
      startDate,
      endDate,
      roomConfig,
      status,
    } = body

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description || null
    if (theme !== undefined) data.theme = theme
    if (coverImage !== undefined) data.coverImage = coverImage || null
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null
    if (roomConfig !== undefined) data.roomConfig = roomConfig || null

    if (status !== undefined) {
      if (status === "PUBLISHED" && !isAdmin) {
        return NextResponse.json(
          { error: "Seul un administrateur peut publier une exposition" },
          { status: 403 }
        )
      }
      data.status = status
    }

    if (title !== undefined && title !== exhibition.title) {
      const base = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      const random = Math.random().toString(36).slice(-4)
      data.slug = `${base}-${random}`
    }

    const updated = await prisma.virtualExhibition.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erreur PUT /api/virtual-exhibitions/[id]:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({ where: { id } })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isCreator = exhibition.createdById === session.user.id
    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    await prisma.virtualExhibition.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur DELETE /api/virtual-exhibitions/[id]:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
