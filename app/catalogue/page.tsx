import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"
import { ArtworkCategory, Prisma } from "@prisma/client"
import CatalogueFilters from "@/components/catalogue/CatalogueFilters"
import ArtworkCard from "@/components/catalogue/ArtworkCard"

// Mapping des catégories pour l'affichage
const categoryLabels: Record<ArtworkCategory, string> = {
  PAINTING: "Peinture",
  SCULPTURE: "Sculpture",
  PHOTOGRAPHY: "Photographie",
  DRAWING: "Dessin",
  PRINT: "Estampe",
  DIGITAL: "Art numérique",
  MIXED_MEDIA: "Technique mixte",
  OTHER: "Autre"
}

// Types pour les filtres
interface FilterParams {
  category?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  artistId?: string
  sort?: string
}

// Récupérer les œuvres avec filtres avancés
async function getArtworks(filters: FilterParams) {
  try {
    const where: Prisma.ArtworkWhereInput = {
      status: "AVAILABLE"
    }
    
    // Filtre par catégorie
    if (filters.category && filters.category !== "all") {
      where.category = filters.category.toUpperCase() as ArtworkCategory
    }
    
    // Recherche par titre ou description
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { medium: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    
    // Filtre par prix minimum
    if (filters.minPrice) {
      where.price = { ...where.price as any, gte: parseFloat(filters.minPrice) }
    }
    
    // Filtre par prix maximum
    if (filters.maxPrice) {
      where.price = { ...where.price as any, lte: parseFloat(filters.maxPrice) }
    }
    
    // Filtre par artiste
    if (filters.artistId && filters.artistId !== "all") {
      where.artistId = filters.artistId
    }
    
    // Tri
    let orderBy: Prisma.ArtworkOrderByWithRelationInput = { createdAt: "desc" }
    switch (filters.sort) {
      case "price_asc":
        orderBy = { price: "asc" }
        break
      case "price_desc":
        orderBy = { price: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "title":
        orderBy = { title: "asc" }
        break
    }
    
    const artworks = await prisma.artwork.findMany({
      where,
      orderBy,
      include: {
        artist: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
    return artworks
  } catch (error) {
    console.error("Erreur récupération œuvres:", error)
    return []
  }
}

// Récupérer tous les artistes avec des œuvres disponibles
async function getArtists() {
  try {
    const artists = await prisma.artistProfile.findMany({
      where: {
        artworks: {
          some: {
            status: "AVAILABLE"
          }
        }
      },
      include: {
        user: {
          select: { name: true }
        },
        _count: {
          select: { artworks: true }
        }
      }
    })
    return artists
  } catch {
    return []
  }
}

// Compter les œuvres par catégorie
async function getCategoryCounts() {
  try {
    const counts = await prisma.artwork.groupBy({
      by: ['category'],
      where: {
        status: "AVAILABLE"
      },
      _count: true
    })
    return counts
  } catch {
    return []
  }
}

export const metadata = {
  title: "Catalogue",
  description: "Découvrez notre collection d'œuvres d'art contemporain",
}

interface PageProps {
  searchParams: { 
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    artistId?: string
    sort?: string
  }
}

export default async function CataloguePage({ searchParams }: PageProps) {
  const currentCategory = searchParams.category || "all"
  const artworks = await getArtworks(searchParams)
  const categoryCounts = await getCategoryCounts()
  const artists = await getArtists()
  
  // Calculer le total
  const totalCount = categoryCounts.reduce((acc, cat) => acc + cat._count, 0)
  
  // Categories disponibles avec compteur
  const categories = [
    { key: "all", label: "Tout", count: totalCount },
    ...Object.entries(categoryLabels).map(([key, label]) => ({
      key: key.toLowerCase(),
      label,
      count: categoryCounts.find(c => c.category === key)?._count || 0
    })).filter(cat => cat.count > 0) // Ne montrer que les catégories avec des œuvres
  ]
  
  // Transformer les artistes pour le composant
  const artistsForFilter = artists.map(a => ({
    id: a.id,
    name: a.user.name || "Artiste"
  }))

  return (
    <>
      <Header />
      <main className="bg-black text-white min-h-screen pt-32">
        {/* Hero Header */}
        <header className="py-16 text-center">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-4">
              Œuvres d'Art Originales à Vendre
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Découvrez notre sélection d'œuvres d'art originales d'artistes contemporains.
            </p>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="border-y border-neutral-800 sticky top-[105px] bg-black/95 backdrop-blur-sm z-40">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left: Filters */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                <CatalogueFilters 
                  artists={artistsForFilter}
                  currentFilters={searchParams}
                />
              </div>
              
              {/* Right: Count & Sort info */}
              <p className="text-neutral-500 text-sm whitespace-nowrap">
                {artworks.length} œuvre{artworks.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="border-b border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((category) => {
                const params = new URLSearchParams()
                if (category.key !== "all") params.set("category", category.key)
                if (searchParams.search) params.set("search", searchParams.search)
                if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice)
                if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice)
                if (searchParams.artistId) params.set("artistId", searchParams.artistId)
                if (searchParams.sort) params.set("sort", searchParams.sort)
                const href = params.toString() ? `/catalogue?${params.toString()}` : "/catalogue"
                
                return (
                  <Link
                    key={category.key}
                    href={href}
                    className={`px-4 py-2 text-sm rounded-full transition-all whitespace-nowrap ${
                      currentCategory === category.key
                        ? "bg-white text-black"
                        : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    {category.label}
                    <span className="ml-1.5 text-xs opacity-60">({category.count})</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Artworks Grid */}
        <section className="py-12">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            {artworks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-neutral-500 text-lg mb-4">
                  Aucune œuvre disponible dans cette catégorie.
                </p>
                <Link 
                  href="/catalogue" 
                  className="text-white underline hover:text-neutral-300"
                >
                  Voir toutes les œuvres
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
