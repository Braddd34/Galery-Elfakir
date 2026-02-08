import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ArtworkCategory, Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

// GET - Récupérer les œuvres avec pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minWidth = searchParams.get("minWidth")
    const maxWidth = searchParams.get("maxWidth")
    const minHeight = searchParams.get("minHeight")
    const maxHeight = searchParams.get("maxHeight")
    const yearFrom = searchParams.get("yearFrom")
    const yearTo = searchParams.get("yearTo")
    const artistId = searchParams.get("artistId")
    const sort = searchParams.get("sort")
    
    const skip = (page - 1) * limit
    
    // Construire les filtres
    const where: Prisma.ArtworkWhereInput = {
      status: "AVAILABLE"
    }
    
    if (category && category !== "all") {
      where.category = category.toUpperCase() as ArtworkCategory
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { medium: { contains: search, mode: "insensitive" } }
      ]
    }
    
    if (minPrice) where.price = { ...where.price as any, gte: parseFloat(minPrice) }
    if (maxPrice) where.price = { ...where.price as any, lte: parseFloat(maxPrice) }
    if (minWidth) where.width = { ...where.width as any, gte: parseFloat(minWidth) }
    if (maxWidth) where.width = { ...where.width as any, lte: parseFloat(maxWidth) }
    if (minHeight) where.height = { ...where.height as any, gte: parseFloat(minHeight) }
    if (maxHeight) where.height = { ...where.height as any, lte: parseFloat(maxHeight) }
    if (yearFrom) where.year = { ...where.year as any, gte: parseInt(yearFrom) }
    if (yearTo) where.year = { ...where.year as any, lte: parseInt(yearTo) }
    if (artistId && artistId !== "all") where.artistId = artistId
    
    // Tri
    let orderBy: Prisma.ArtworkOrderByWithRelationInput = { createdAt: "desc" }
    switch (sort) {
      case "price_asc": orderBy = { price: "asc" }; break
      case "price_desc": orderBy = { price: "desc" }; break
      case "popular": orderBy = { views: "desc" }; break
      case "year_desc": orderBy = { year: "desc" }; break
      case "year_asc": orderBy = { year: "asc" }; break
      case "oldest": orderBy = { createdAt: "asc" }; break
    }
    
    // Requête avec pagination
    const [artworks, totalCount] = await Promise.all([
      prisma.artwork.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          artist: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      }),
      prisma.artwork.count({ where })
    ])
    
    return NextResponse.json({
      artworks,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + artworks.length < totalCount
      }
    })
  } catch (error) {
    console.error("Erreur catalogue API:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
