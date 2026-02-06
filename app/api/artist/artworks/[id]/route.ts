import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET: Récupérer une œuvre spécifique de l'artiste
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Récupérer l'œuvre
    const artwork = await prisma.artwork.findFirst({
      where: {
        id,
        artistId: artistProfile.id // S'assurer que l'œuvre appartient à l'artiste
      }
    })

    if (!artwork) {
      return NextResponse.json({ error: "Œuvre non trouvée" }, { status: 404 })
    }

    return NextResponse.json({ artwork })
  } catch (error) {
    console.error("Erreur récupération œuvre:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT: Modifier une œuvre de l'artiste
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Vérifier que l'œuvre appartient à l'artiste
    const existingArtwork = await prisma.artwork.findFirst({
      where: {
        id,
        artistId: artistProfile.id
      }
    })

    if (!existingArtwork) {
      return NextResponse.json({ error: "Œuvre non trouvée" }, { status: 404 })
    }

    // Vérifier que l'œuvre peut être modifiée (pas vendue)
    if (existingArtwork.status === "SOLD") {
      return NextResponse.json({ 
        error: "Cette œuvre a été vendue et ne peut plus être modifiée" 
      }, { status: 400 })
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

    // Formater les images
    const imagesData = images.map((img: any, index: number) => ({
      url: img.url,
      key: img.key,
      order: index
    }))

    // Déterminer le nouveau statut
    // Si l'œuvre était rejetée ou en brouillon et qu'elle est modifiée, elle repasse en attente
    let newStatus = existingArtwork.status
    if (existingArtwork.status === "DRAFT" || existingArtwork.status === "ARCHIVED") {
      newStatus = "PENDING"
    }

    // Mettre à jour l'œuvre
    const artwork = await prisma.artwork.update({
      where: { id },
      data: {
        title,
        description,
        category: category,
        year: parseInt(year),
        width: parseFloat(width),
        height: parseFloat(height),
        depth: depth ? parseFloat(depth) : null,
        medium,
        price: parseFloat(price),
        images: JSON.stringify(imagesData),
        status: newStatus
      }
    })

    return NextResponse.json({ 
      success: true, 
      artwork,
      message: newStatus === "PENDING" 
        ? "Œuvre mise à jour et soumise à validation"
        : "Œuvre mise à jour avec succès"
    })

  } catch (error) {
    console.error("Erreur modification œuvre:", error)
    return NextResponse.json({ error: "Erreur lors de la modification de l'œuvre" }, { status: 500 })
  }
}

// DELETE: Supprimer une œuvre (archiver)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Vérifier que l'œuvre appartient à l'artiste
    const existingArtwork = await prisma.artwork.findFirst({
      where: {
        id,
        artistId: artistProfile.id
      }
    })

    if (!existingArtwork) {
      return NextResponse.json({ error: "Œuvre non trouvée" }, { status: 404 })
    }

    // Vérifier que l'œuvre peut être supprimée (pas vendue)
    if (existingArtwork.status === "SOLD") {
      return NextResponse.json({ 
        error: "Cette œuvre a été vendue et ne peut pas être supprimée" 
      }, { status: 400 })
    }

    // Archiver l'œuvre au lieu de la supprimer définitivement
    await prisma.artwork.update({
      where: { id },
      data: { status: "ARCHIVED" }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Œuvre archivée avec succès" 
    })

  } catch (error) {
    console.error("Erreur suppression œuvre:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'œuvre" }, { status: 500 })
  }
}
