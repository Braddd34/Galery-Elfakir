import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Générer un slug unique
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      year,
      width,
      height,
      depth,
      medium,
      support,
      price,
      artistId,
      status,
      imageUrl,
    } = body

    // Validation
    if (!title || !description || !category || !year || !width || !height || !medium || !price || !artistId || !imageUrl) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      )
    }

    // Vérifier que l'artiste existe
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId }
    })

    if (!artist) {
      return NextResponse.json(
        { error: "Artiste non trouvé" },
        { status: 404 }
      )
    }

    // Générer un slug unique
    let slug = generateSlug(title)
    const existingArtwork = await prisma.artwork.findUnique({
      where: { slug }
    })
    if (existingArtwork) {
      slug = `${slug}-${Date.now()}`
    }

    // Créer l'œuvre
    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        category: category as any,
        year: parseInt(year),
        width: parseFloat(width),
        height: parseFloat(height),
        depth: depth ? parseFloat(depth) : null,
        medium,
        support: support || null,
        price: parseFloat(price),
        artistId,
        status: status as any || "DRAFT",
        slug,
        images: JSON.stringify([{ url: imageUrl, order: 0 }]),
        tags: [],
        publishedAt: status === "AVAILABLE" ? new Date() : null,
      }
    })

    return NextResponse.json({
      success: true,
      artwork: {
        id: artwork.id,
        title: artwork.title,
        slug: artwork.slug,
      }
    })

  } catch (error) {
    console.error("Erreur création œuvre:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const artworks = await prisma.artwork.findMany({
      include: {
        artist: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ artworks })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
