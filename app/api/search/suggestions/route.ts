import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * GET /api/search/suggestions
 * Retourne des suggestions de recherche basées sur la requête
 */
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Recherche en parallèle dans les œuvres et les artistes
    const [artworks, artists] = await Promise.all([
      // Œuvres correspondantes
      prisma.artwork.findMany({
        where: {
          status: "AVAILABLE",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          price: true,
          artist: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      // Artistes correspondants
      prisma.artistProfile.findMany({
        where: {
          verified: true,
          user: {
            name: { contains: query, mode: "insensitive" },
          },
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              artworks: {
                where: { status: "AVAILABLE" },
              },
            },
          },
        },
        take: 3,
      }),
    ])

    // Formatter les résultats
    const suggestions = {
      artworks: artworks.map((a) => {
        let imageUrl = null
        try {
          const images = typeof a.images === "string" ? JSON.parse(a.images) : a.images
          imageUrl = images?.[0]?.url || null
        } catch {}

        return {
          id: a.id,
          type: "artwork" as const,
          title: a.title,
          slug: a.slug,
          image: imageUrl,
          price: Number(a.price),
          artistName: a.artist?.user?.name || "Artiste",
        }
      }),
      artists: artists.map((a) => ({
        id: a.id,
        type: "artist" as const,
        name: a.user.name,
        image: a.user.image,
        artworksCount: a._count.artworks,
      })),
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Erreur suggestions:", error)
    return NextResponse.json({ suggestions: { artworks: [], artists: [] } })
  }
}
