import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Récupérer une wishlist publique par userId
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    // Récupérer l'utilisateur et ses favoris
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        favorites: {
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
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }
    
    // Ne retourner que les œuvres disponibles
    const wishlist = user.favorites
      .filter(fav => fav.artwork.status === "AVAILABLE")
      .map(fav => ({
        id: fav.artwork.id,
        title: fav.artwork.title,
        slug: fav.artwork.slug,
        price: Number(fav.artwork.price),
        images: fav.artwork.images,
        category: fav.artwork.category,
        year: fav.artwork.year,
        artistName: fav.artwork.artist.user.name || "Artiste",
        addedAt: fav.createdAt
      }))
    
    return NextResponse.json({
      userName: user.name,
      userImage: user.image,
      artworks: wishlist,
      count: wishlist.length
    })
  } catch (error) {
    console.error("Erreur récupération wishlist:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
