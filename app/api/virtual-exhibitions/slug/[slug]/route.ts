import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { slug, status: "PUBLISHED" },
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
      return NextResponse.json(
        { error: "Exposition non trouvée" },
        { status: 404 }
      )
    }

    await prisma.virtualExhibition.update({
      where: { id: exhibition.id },
      data: { views: { increment: 1 } },
    })
    exhibition.views += 1

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
    console.error("Erreur GET /api/virtual-exhibitions/slug/[slug]:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
