import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { cleanupArtworkImages } from "@/lib/s3"
import { logAudit } from "@/lib/audit"

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
          select: {
            id: true,
            bio: true,
            country: true,
            city: true,
            user: {
              select: { name: true, image: true }
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

    // Préparer les données des images et nettoyer les anciennes sur S3
    let imagesData = existing.images
    if (images) {
      const oldImages = typeof existing.images === "string" ? JSON.parse(existing.images) : existing.images
      const newUrls = new Set(images.map((img: any) => img.url))
      if (Array.isArray(oldImages)) {
        const removedImages = oldImages.filter((img: any) => !newUrls.has(img.url))
        if (removedImages.length > 0) {
          await cleanupArtworkImages(removedImages)
        }
      }
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

    await logAudit({
      userId: session.user.id,
      action: "update_artwork",
      target: params.id,
      details: { title }
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

    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id },
      select: { images: true }
    })

    await prisma.artwork.delete({
      where: { id: params.id }
    })

    if (artwork?.images) {
      await cleanupArtworkImages(artwork.images)
    }

    await logAudit({
      userId: session.user.id,
      action: "delete_artwork",
      target: params.id
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
