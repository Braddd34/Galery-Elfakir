import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"
import { ArtworkCategory, Prisma } from "@prisma/client"
import CatalogueFilters from "@/components/catalogue/CatalogueFilters"

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

// Helper pour extraire l'URL de l'image
function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
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
      <main className="bg-black text-white min-h-screen pt-28">
        {/* Hero Header */}
        <header className="pt-12 pb-20 border-b border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="label mb-4 text-gold">Notre collection</p>
                <h1 className="heading-xl">Œuvres</h1>
              </div>
              <p className="text-neutral-500 max-w-md">
                Une sélection minutieuse d'œuvres originales, 
                choisies pour leur qualité artistique exceptionnelle.
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b border-neutral-800 sticky top-[73px] bg-black z-40">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-6">
            {/* Barre de recherche et filtres avancés */}
            <CatalogueFilters 
              artists={artistsForFilter}
              currentFilters={searchParams}
            />
            
            {/* Categories */}
            <div className="flex flex-wrap items-center justify-between gap-6 mt-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {categories.map((category) => {
                  // Construire l'URL en gardant les autres filtres
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
                      className={`px-6 py-3 text-sm tracking-[0.1em] uppercase transition-all border whitespace-nowrap ${
                        currentCategory === category.key
                          ? "bg-white text-black border-white"
                          : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
                      }`}
                    >
                      {category.label}
                      <span className="ml-2 text-xs opacity-60">({category.count})</span>
                    </Link>
                  )
                })}
              </div>
              
              {/* Count */}
              <p className="text-neutral-500 text-sm">
                {artworks.length} œuvre{artworks.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Artworks Grid */}
        <section className="py-20">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            {artworks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {artworks.map((artwork) => (
                  <Link 
                    key={artwork.id} 
                    href={`/oeuvre/${artwork.slug}`}
                    className="group"
                  >
                    {/* Image */}
                    <div className="relative img-zoom aspect-[3/4] bg-neutral-900 mb-6">
                      <img
                        src={getImageUrl(artwork.images)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-sm tracking-[0.2em] uppercase border border-white px-8 py-4 bg-black/50 backdrop-blur">
                          Voir l'œuvre
                        </span>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="space-y-2">
                      <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
                        {categoryLabels[artwork.category]} — {artwork.year}
                      </p>
                      <h3 className="text-lg font-light group-hover:text-gold transition-colors duration-300">
                        {artwork.title}
                      </h3>
                      <p className="text-neutral-500 text-sm">{artwork.artist.user.name}</p>
                      <p className="text-lg pt-2">€{Number(artwork.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // Message si pas d'œuvres
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
