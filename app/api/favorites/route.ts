import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET: Récupérer les favoris de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { artworkId: true }
    })

    return NextResponse.json({ 
      favoriteIds: favorites.map(f => f.artworkId) 
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST: Ajouter/Retirer un favori (toggle)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 })
    }

    const { artworkId } = await request.json()

    if (!artworkId) {
      return NextResponse.json({ error: "artworkId requis" }, { status: 400 })
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
      return NextResponse.json({ isFavorite: false, message: "Retiré des favoris" })
    } else {
      // Ajouter le favori
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          artworkId: artworkId
        }
      })
      return NextResponse.json({ isFavorite: true, message: "Ajouté aux favoris" })
    }
  } catch (error) {
    console.error("Erreur favoris:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
