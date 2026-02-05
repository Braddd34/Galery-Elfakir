import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET: Récupérer une œuvre par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id },
      include: {
        artist: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
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

// PUT: Mettre à jour une œuvre
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, status, year, width, height, depth, medium, price, images } = body

    // Vérifier que l'œuvre existe
    const existing = await prisma.artwork.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: "Œuvre non trouvée" }, { status: 404 })
    }

    // Préparer les données des images
    let imagesData = existing.images
    if (images) {
      imagesData = JSON.stringify(images.map((img: any, index: number) => ({
        url: img.url,
        key: img.key,
        order: index
      })))
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      title,
      description,
      category,
      status,
      year: parseInt(year),
      medium,
      price: parseFloat(price),
      images: imagesData
    }
    
    // Ajouter les dimensions seulement si fournies
    if (width) updateData.width = parseFloat(width)
    if (height) updateData.height = parseFloat(height)
    if (depth) updateData.depth = parseFloat(depth)
    else updateData.depth = null

    // Mettre à jour l'œuvre
    const artwork = await prisma.artwork.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      artwork,
      message: "Œuvre mise à jour avec succès"
    })

  } catch (error) {
    console.error("Erreur mise à jour œuvre:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

// DELETE: Supprimer une œuvre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await prisma.artwork.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Œuvre supprimée avec succès"
    })

  } catch (error) {
    console.error("Erreur suppression œuvre:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
