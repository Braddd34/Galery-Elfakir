import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET: Récupérer la liste complète des favoris avec les détails des œuvres
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non connecté", favorites: [] }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        artwork: {
          include: {
            artist: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Filtrer les favoris dont l'œuvre a été supprimée
    const validFavorites = favorites.filter(f => f.artwork !== null)

    return NextResponse.json({ 
      favorites: validFavorites.map(f => ({
        id: f.id,
        artworkId: f.artworkId,
        artwork: {
          id: f.artwork.id,
          title: f.artwork.title,
          slug: f.artwork.slug,
          price: Number(f.artwork.price),
          images: f.artwork.images,
          artist: {
            user: {
              name: f.artwork.artist.user.name
            }
          }
        }
      }))
    })
  } catch (error) {
    console.error("[Favorites List] Error:", error)
    return NextResponse.json({ error: "Erreur serveur", favorites: [] }, { status: 500 })
  }
}
