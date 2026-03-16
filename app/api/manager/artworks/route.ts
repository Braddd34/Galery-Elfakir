import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getManagerArtistIds } from "@/lib/manager-utils"

export const dynamic = "force-dynamic"

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${randomSuffix}`
}

// GET: Récupérer les œuvres des artistes assignés au manager
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    let assignedArtistIds: string[]

    if (session.user.role === "ADMIN") {
      const allArtists = await prisma.artistProfile.findMany({
        select: { id: true }
      })
      assignedArtistIds = allArtists.map(a => a.id)
    } else {
      assignedArtistIds = await getManagerArtistIds(session.user.id)
    }

    if (assignedArtistIds.length === 0) {
      return NextResponse.json({ artworks: [] })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const artistId = searchParams.get("artistId") || ""
    const sort = searchParams.get("sort") || "newest"

    // Filtre de base : uniquement les artistes assignés
    const where: any = {
      artistId: { in: assignedArtistIds }
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }

    if (status) {
      where.status = status
    }

    if (artistId && assignedArtistIds.includes(artistId)) {
      where.artistId = artistId
    }

    let orderBy: any = { createdAt: "desc" }
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "price_asc":
        orderBy = { price: "asc" }
        break
      case "price_desc":
        orderBy = { price: "desc" }
        break
      case "views":
        orderBy = { views: "desc" }
        break
      case "title":
        orderBy = { title: "asc" }
        break
    }

    const artworks = await prisma.artwork.findMany({
      where,
      include: {
        artist: {
          select: { user: { select: { name: true } } }
        }
      },
      orderBy
    })

    const result = artworks.map(a => ({
      ...a,
      artistName: a.artist?.user?.name || "Inconnu",
      artist: undefined
    }))

    return NextResponse.json({ artworks: result })
  } catch (error) {
    console.error("Erreur récupération œuvres manager:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST: Créer une œuvre pour un artiste assigné
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { artistId, images, ...fields } = body

    if (!artistId) {
      return NextResponse.json(
        { error: "L'identifiant de l'artiste est requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'artiste fait partie des assignés
    let assignedArtistIds: string[]

    if (session.user.role === "ADMIN") {
      const allArtists = await prisma.artistProfile.findMany({
        select: { id: true }
      })
      assignedArtistIds = allArtists.map(a => a.id)
    } else {
      assignedArtistIds = await getManagerArtistIds(session.user.id)
    }

    if (!assignedArtistIds.includes(artistId)) {
      return NextResponse.json(
        { error: "Cet artiste ne fait pas partie de vos artistes assignés" },
        { status: 403 }
      )
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "Au moins une image est requise" },
        { status: 400 }
      )
    }

    const { artworkSchema } = await import("@/lib/validations")
    const { sanitize } = await import("@/lib/sanitize")

    const parsed = artworkSchema.safeParse({
      ...fields,
      year: Number(fields.year),
      width: Number(fields.width),
      height: Number(fields.height),
      depth: fields.depth ? Number(fields.depth) : undefined,
      price: Number(fields.price)
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const valid = parsed.data

    const slug = generateSlug(valid.title)

    const imagesData = images.map((img: any, index: number) => ({
      url: img.url,
      key: img.key,
      order: index
    }))

    const artwork = await prisma.artwork.create({
      data: {
        title: sanitize(valid.title),
        slug,
        description: sanitize(valid.description),
        category: valid.category,
        year: valid.year,
        width: valid.width ?? 0,
        height: valid.height ?? 0,
        depth: valid.depth ?? null,
        medium: valid.medium ? sanitize(valid.medium) : "",
        price: valid.price,
        images: JSON.stringify(imagesData),
        status: "PENDING",
        artistId
      }
    })

    return NextResponse.json({
      success: true,
      artwork,
      message: "Œuvre soumise avec succès. Elle sera visible après validation par un administrateur."
    }, { status: 201 })
  } catch (error) {
    console.error("Erreur création œuvre manager:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'œuvre" },
      { status: 500 }
    )
  }
}
