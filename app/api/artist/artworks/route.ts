import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Fonction pour générer un slug unique
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

// GET: Récupérer les œuvres de l'artiste connecté
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    if (session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer le profil artiste
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    const artworks = await prisma.artwork.findMany({
      where: { artistId: artistProfile.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ artworks })
  } catch (error) {
    console.error("Erreur récupération œuvres:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST: Créer une nouvelle œuvre pour l'artiste
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    if (session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer le profil artiste
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, category, year, width, height, depth, medium, price, images } = body

    // Validation
    if (!title || !description || !category || !year || !width || !height || !medium || !price) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "Au moins une image est requise" }, { status: 400 })
    }

    // Générer le slug
    const slug = generateSlug(title)

    // Formater les images
    const imagesData = images.map((img: any, index: number) => ({
      url: img.url,
      key: img.key,
      order: index
    }))

    // Créer l'œuvre avec le statut "PENDING" (en attente de validation)
    const artwork = await prisma.artwork.create({
      data: {
        title,
        slug,
        description,
        category: category,
        year: parseInt(year),
        width: parseFloat(width),
        height: parseFloat(height),
        depth: depth ? parseFloat(depth) : null,
        medium,
        price: parseFloat(price),
        images: JSON.stringify(imagesData),
        status: "PENDING", // L'œuvre doit être validée par un admin
        artistId: artistProfile.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      artwork,
      message: "Œuvre soumise avec succès. Elle sera visible après validation par un administrateur."
    }, { status: 201 })

  } catch (error) {
    console.error("Erreur création œuvre:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'œuvre" }, { status: 500 })
  }
}
