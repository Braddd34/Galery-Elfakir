import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * API de recommandations personnalisées "Vous aimerez aussi".
 * 
 * Logique de recommandation :
 * 1. Si l'utilisateur est connecté : regarde ses favoris et propose des œuvres
 *    similaires (même catégorie, même artiste, fourchette de prix proche)
 * 2. Si non connecté ou pas de favoris : recommande les œuvres populaires
 * 3. Exclut l'œuvre courante (si artworkId fourni) et les œuvres déjà en favoris
 */
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const artworkId = searchParams.get("artworkId") // Œuvre courante à exclure
    const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20)

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    let recommendations: any[] = []
    const excludeIds = artworkId ? [artworkId] : []

    if (userId) {
      // Récupérer les favoris de l'utilisateur
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          artwork: {
            select: {
              id: true,
              category: true,
              artistId: true,
              price: true
            }
          }
        },
        take: 50
      })

      // Ajouter les favoris à la liste d'exclusion
      favorites.forEach(fav => excludeIds.push(fav.artworkId))

      if (favorites.length > 0) {
        // Extraire les catégories et artistes préférés
        const favoriteCategories = [...new Set(favorites.map(f => f.artwork.category))]
        const favoriteArtists = [...new Set(favorites.map(f => f.artwork.artistId))]
        
        // Calculer la fourchette de prix des favoris
        const prices = favorites.map(f => Number(f.artwork.price))
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const minPrice = avgPrice * 0.5
        const maxPrice = avgPrice * 2

        // Stratégie 1 : Œuvres des mêmes artistes (40% du résultat)
        const sameArtistLimit = Math.ceil(limit * 0.4)
        const sameArtist = await prisma.artwork.findMany({
          where: {
            status: "AVAILABLE",
            id: { notIn: excludeIds },
            artistId: { in: favoriteArtists }
          },
          take: sameArtistLimit,
          orderBy: [
            { views: "desc" },
            { createdAt: "desc" }
          ],
          include: {
            artist: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        })

        recommendations.push(...sameArtist)
        sameArtist.forEach(a => excludeIds.push(a.id))

        // Stratégie 2 : Mêmes catégories, prix similaire (40%)
        const sameCategoryLimit = Math.ceil(limit * 0.4)
        const sameCategory = await prisma.artwork.findMany({
          where: {
            status: "AVAILABLE",
            id: { notIn: excludeIds },
            category: { in: favoriteCategories },
            price: {
              gte: minPrice,
              lte: maxPrice
            }
          },
          take: sameCategoryLimit,
          orderBy: [
            { views: "desc" },
            { createdAt: "desc" }
          ],
          include: {
            artist: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        })

        recommendations.push(...sameCategory)
        sameCategory.forEach(a => excludeIds.push(a.id))

        // Stratégie 3 : Mêmes catégories sans contrainte de prix (reste)
        const remaining = limit - recommendations.length
        if (remaining > 0) {
          const moreSameCategory = await prisma.artwork.findMany({
            where: {
              status: "AVAILABLE",
              id: { notIn: excludeIds },
              category: { in: favoriteCategories }
            },
            take: remaining,
            orderBy: [
              { views: "desc" },
              { createdAt: "desc" }
            ],
            include: {
              artist: {
                include: {
                  user: { select: { name: true } }
                }
              }
            }
          })
          recommendations.push(...moreSameCategory)
          moreSameCategory.forEach(a => excludeIds.push(a.id))
        }
      }
    }

    // Compléter avec les œuvres populaires si pas assez de recommandations
    const remaining = limit - recommendations.length
    if (remaining > 0) {
      const popular = await prisma.artwork.findMany({
        where: {
          status: "AVAILABLE",
          id: { notIn: excludeIds }
        },
        take: remaining,
        orderBy: [
          { views: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          artist: {
            include: {
              user: { select: { name: true } }
            }
          }
        }
      })
      recommendations.push(...popular)
    }

    // Formater la réponse
    const formattedRecommendations = recommendations.map(artwork => {
      let imageUrl = ""
      try {
        const images = typeof artwork.images === "string" ? JSON.parse(artwork.images) : artwork.images
        if (images?.[0]?.url) imageUrl = images[0].url
      } catch {}

      return {
        id: artwork.id,
        title: artwork.title,
        slug: artwork.slug,
        price: Number(artwork.price),
        category: artwork.category,
        year: artwork.year,
        imageUrl,
        artistName: artwork.artist?.user?.name || "Artiste",
        artistId: artwork.artistId
      }
    })

    return NextResponse.json({
      recommendations: formattedRecommendations,
      isPersonalized: !!userId && recommendations.length > 0
    })

  } catch (error) {
    console.error("Erreur recommandations:", error)
    return NextResponse.json(
      { error: "Erreur serveur", recommendations: [] },
      { status: 500 }
    )
  }
}
