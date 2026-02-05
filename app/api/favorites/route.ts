import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Force le rendu dynamique
export const dynamic = 'force-dynamic'

// GET: Récupérer les favoris de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non connecté", favoriteIds: [] }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { artworkId: true }
    })

    console.log(`[Favorites] User ${session.user.id} has ${favorites.length} favorites`)

    return NextResponse.json({ 
      favoriteIds: favorites.map(f => f.artworkId) 
    })
  } catch (error) {
    console.error("[Favorites] GET Error:", error)
    return NextResponse.json({ error: "Erreur serveur", favoriteIds: [] }, { status: 500 })
  }
}

// POST: Ajouter/Retirer un favori (toggle)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const body = await request.json()
    const { artworkId } = body

    if (!artworkId) {
      return NextResponse.json({ error: "artworkId requis" }, { status: 400 })
    }

    console.log(`[Favorites] Toggle favorite for user ${session.user.id}, artwork ${artworkId}`)

    // Vérifier si l'œuvre existe
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId }
    })

    if (!artwork) {
      return NextResponse.json({ error: "Œuvre non trouvée" }, { status: 404 })
    }

    // Vérifier si le favori existe déjà
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_artworkId: {
          userId: session.user.id,
          artworkId: artworkId
        }
      }
    })

    if (existing) {
      // Supprimer le favori
      await prisma.favorite.delete({
        where: { id: existing.id }
      })
      console.log(`[Favorites] Removed favorite ${existing.id}`)
      return NextResponse.json({ isFavorite: false, message: "Retiré des favoris" })
    } else {
      // Ajouter le favori
      const newFavorite = await prisma.favorite.create({
        data: {
          userId: session.user.id,
          artworkId: artworkId
        }
      })
      console.log(`[Favorites] Created favorite ${newFavorite.id}`)
      return NextResponse.json({ isFavorite: true, message: "Ajouté aux favoris" })
    }
  } catch (error) {
    console.error("[Favorites] POST Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
