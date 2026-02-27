import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id },
      include: {
        artworks: {
          include: {
            artwork: {
              include: {
                artist: {
                  include: {
                    user: { select: { name: true } }
                  }
                }
              }
            }
          },
          orderBy: { displayOrder: "asc" }
        }
      }
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    const isCreator = session?.user?.id === exhibition.createdById
    const isAdmin = session?.user?.role === "ADMIN"

    if (exhibition.status !== "PUBLISHED" && !isCreator && !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const artworks = exhibition.artworks.map((vea) => ({
      id: vea.id,
      artworkId: vea.artworkId,
      wall: vea.wall,
      positionX: vea.positionX,
      positionY: vea.positionY,
      scale: vea.scale,
      displayOrder: vea.displayOrder,
      artwork: {
        title: vea.artwork.title,
        images: vea.artwork.images,
        price: vea.artwork.price,
        slug: vea.artwork.slug,
        width: vea.artwork.width,
        height: vea.artwork.height,
        category: vea.artwork.category,
        artist: vea.artwork.artist.user.name
      }
    }))

    return NextResponse.json({ artworks })
  } catch (error) {
    console.error("Erreur GET artworks:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id }
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const isCreator = session.user.id === exhibition.createdById
    const isAdmin = session.user.role === "ADMIN"
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { placements } = body as {
      placements: Array<{
        artworkId: string
        wall: string
        positionX: number
        positionY: number
        scale?: number
        displayOrder?: number
      }>
    }

    if (!Array.isArray(placements) || placements.length === 0) {
      return NextResponse.json(
        { error: "placements doit être un tableau non vide" },
        { status: 400 }
      )
    }

    const validWalls = ["north", "south", "east", "west"]
    for (const p of placements) {
      if (!p.artworkId || !p.wall || p.positionX === undefined || p.positionY === undefined) {
        return NextResponse.json(
          { error: `Placement invalide pour ${p.artworkId}: artworkId, wall, positionX et positionY requis` },
          { status: 400 }
        )
      }
      if (!validWalls.includes(p.wall)) {
        return NextResponse.json(
          { error: `Mur invalide: ${p.wall}` },
          { status: 400 }
        )
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.virtualExhibitionArtwork.deleteMany({
        where: { exhibitionId: id }
      })

      const created = await Promise.all(
        placements.map((p, index) =>
          tx.virtualExhibitionArtwork.create({
            data: {
              exhibitionId: id,
              artworkId: p.artworkId,
              wall: p.wall,
              positionX: parseFloat(String(p.positionX)),
              positionY: parseFloat(String(p.positionY)),
              scale: p.scale ? parseFloat(String(p.scale)) : 1.0,
              displayOrder: p.displayOrder ?? index,
            },
          })
        )
      )

      return created
    })

    return NextResponse.json({
      success: true,
      count: result.length,
      placements: result,
    })
  } catch (error) {
    console.error("Erreur PUT artworks (batch):", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id }
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const isCreator = session.user.id === exhibition.createdById
    const isAdmin = session.user.role === "ADMIN"
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { artworkId, wall, positionX, positionY, scale = 1.0, displayOrder } = body

    if (!artworkId || !wall || positionX === undefined || positionY === undefined) {
      return NextResponse.json(
        { error: "artworkId, wall, positionX et positionY sont requis" },
        { status: 400 }
      )
    }

    const validWalls = ["north", "south", "east", "west"]
    if (!validWalls.includes(wall)) {
      return NextResponse.json(
        { error: "wall doit être north, south, east ou west" },
        { status: 400 }
      )
    }

    const px = parseFloat(positionX)
    const py = parseFloat(positionY)
    if (isNaN(px) || px < 0 || px > 1 || isNaN(py) || py < 0 || py > 1) {
      return NextResponse.json(
        { error: "positionX et positionY doivent être entre 0 et 1" },
        { status: 400 }
      )
    }

    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: {
        artist: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    })

    if (!artwork) {
      return NextResponse.json({ error: "Œuvre non trouvée" }, { status: 404 })
    }

    if (artwork.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Cette œuvre est archivée et ne peut pas être ajoutée" },
        { status: 400 }
      )
    }

    const created = await prisma.virtualExhibitionArtwork.upsert({
      where: {
        exhibitionId_artworkId: { exhibitionId: id, artworkId }
      },
      update: {
        wall,
        positionX: px,
        positionY: py,
        scale: typeof scale === "number" ? scale : parseFloat(scale) || 1.0,
        displayOrder: displayOrder ?? 0
      },
      create: {
        exhibitionId: id,
        artworkId,
        wall,
        positionX: px,
        positionY: py,
        scale: typeof scale === "number" ? scale : parseFloat(scale) || 1.0,
        displayOrder: displayOrder ?? 0
      },
      include: {
        artwork: {
          include: {
            artist: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      ...created,
      artwork: {
        title: created.artwork.title,
        images: created.artwork.images,
        price: created.artwork.price,
        slug: created.artwork.slug,
        width: created.artwork.width,
        height: created.artwork.height,
        category: created.artwork.category,
        artist: created.artwork.artist.user.name
      }
    })
  } catch (error) {
    console.error("Erreur POST artwork:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id }
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const isCreator = session.user.id === exhibition.createdById
    const isAdmin = session.user.role === "ADMIN"
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    let artworkId: string | null = null
    const contentType = request.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      try {
        const body = await request.json()
        artworkId = body.artworkId ?? null
      } catch {
        artworkId = null
      }
    }
    if (!artworkId) {
      const url = new URL(request.url)
      artworkId = url.searchParams.get("artworkId")
    }

    if (!artworkId) {
      return NextResponse.json(
        { error: "artworkId requis (body ou query)" },
        { status: 400 }
      )
    }

    await prisma.virtualExhibitionArtwork.deleteMany({
      where: {
        exhibitionId: id,
        artworkId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur DELETE artwork:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
