import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"
import { ArtworkCategory } from "@prisma/client"
import AddToCartButton from "@/components/cart/AddToCartButton"
import { Metadata } from "next"

// Générer les meta tags dynamiques pour le SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const artwork = await prisma.artwork.findUnique({
    where: { slug: params.slug },
    include: {
      artist: {
        include: {
          user: { select: { name: true } }
        }
      }
    }
  })

  if (!artwork) {
    return {
      title: "Œuvre non trouvée"
    }
  }

  const artistName = artwork.artist.user.name || "Artiste"
  let imageUrl = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200"
  
  try {
    const images = typeof artwork.images === 'string' ? JSON.parse(artwork.images) : artwork.images
    if (images?.[0]?.url) imageUrl = images[0].url
  } catch {}

  return {
    title: `${artwork.title} par ${artistName}`,
    description: artwork.description.substring(0, 160),
    openGraph: {
      title: `${artwork.title} — ELFAKIR`,
      description: artwork.description.substring(0, 160),
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: artwork.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${artwork.title} — ELFAKIR`,
      description: artwork.description.substring(0, 160),
      images: [imageUrl]
    }
  }
}

// Mapping des catégories
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

// Helper pour extraire les images
function getImages(images: any): { url: string }[] {
  const fallback = [{ url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200" }]
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed.length > 0 ? parsed : fallback
  } catch {
    return fallback
  }
}

// Récupérer l'œuvre par slug
async function getArtwork(slug: string) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { slug },
      include: {
        artist: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })
    
    // Incrémenter les vues
    if (artwork) {
      await prisma.artwork.update({
        where: { id: artwork.id },
        data: { views: { increment: 1 } }
      })
    }
    
    return artwork
  } catch (error) {
    console.error("Erreur récupération œuvre:", error)
    return null
  }
}

// Récupérer des œuvres similaires
async function getSimilarArtworks(artworkId: string, category: ArtworkCategory, artistId: string) {
  try {
    const artworks = await prisma.artwork.findMany({
      where: {
        status: "AVAILABLE",
        id: { not: artworkId },
        OR: [
          { category },
          { artistId }
        ]
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        artist: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })
    return artworks
  } catch {
    return []
  }
}

export default async function ArtworkPage({ params }: { params: { slug: string } }) {
  const artwork = await getArtwork(params.slug)
  
  if (!artwork) {
    notFound()
  }
  
  const images = getImages(artwork.images)
  const similarArtworks = await getSimilarArtworks(artwork.id, artwork.category, artwork.artistId)
  const artistName = artwork.artist.user.name || "Artiste"
  const baseUrl = "https://galeryelfakir.vercel.app"

  // Données structurées JSON-LD pour le SEO (Product + VisualArtwork)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "VisualArtwork"],
    name: artwork.title,
    description: artwork.description,
    image: images.map(img => img.url),
    url: `${baseUrl}/oeuvre/${artwork.slug}`,
    brand: {
      "@type": "Organization",
      name: "ELFAKIR Gallery"
    },
    creator: {
      "@type": "Person",
      name: artistName,
      url: `${baseUrl}/artiste/${artwork.artistId}`
    },
    artMedium: artwork.medium,
    artworkSurface: artwork.support || undefined,
    dateCreated: artwork.year.toString(),
    width: {
      "@type": "Distance",
      name: `${Number(artwork.width)} cm`
    },
    height: {
      "@type": "Distance",
      name: `${Number(artwork.height)} cm`
    },
    artform: categoryLabels[artwork.category],
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/oeuvre/${artwork.slug}`,
      priceCurrency: "EUR",
      price: Number(artwork.price),
      availability: artwork.status === "AVAILABLE" 
        ? "https://schema.org/InStock" 
        : "https://schema.org/SoldOut",
      seller: {
        "@type": "Organization",
        name: "ELFAKIR Gallery"
      }
    }
  }

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collection",
        item: `${baseUrl}/catalogue`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: artwork.title,
        item: `${baseUrl}/oeuvre/${artwork.slug}`
      }
    ]
  }

  return (
    <>
      {/* JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main id="main-content" className="bg-black text-white min-h-screen pt-28">
        {/* Breadcrumb */}
        <div className="border-b border-neutral-800/50">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-4">
            <nav className="flex items-center gap-3 text-sm text-neutral-500">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/catalogue" className="hover:text-white transition-colors">Collection</Link>
              <span>/</span>
              <span className="text-white">{artwork.title}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="grid lg:grid-cols-12 gap-16">
              
              {/* Left: Images */}
              <div className="lg:col-span-7 space-y-4">
                {/* Main Image */}
                <div className="aspect-[4/5] bg-neutral-900">
                  <img 
                    src={images[0]?.url} 
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, i) => (
                      <div 
                        key={i}
                        className={`aspect-square bg-neutral-900 cursor-pointer transition-opacity ${
                          i === 0 ? "ring-1 ring-white" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-10">
                
                {/* Header */}
                <div>
                  <p className="label text-gold mb-4">
                    {categoryLabels[artwork.category]} — {artwork.year}
                  </p>
                  <h1 className="heading-md mb-2">{artwork.title}</h1>
                  <p className="text-neutral-500 text-lg">{artwork.medium}</p>
                </div>

                {/* Artist */}
                <Link 
                  href={`/artiste/${artwork.artistId}`}
                  className="flex items-center gap-5 py-6 border-y border-neutral-800 group"
                >
                  <img 
                    src={artwork.artist.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"} 
                    alt={artwork.artist.user.name || "Artiste"}
                    className="w-16 h-16 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-lg group-hover:text-gold transition-colors">
                      {artwork.artist.user.name}
                    </p>
                    <p className="text-neutral-500 text-sm">
                      {artwork.artist.city && artwork.artist.country 
                        ? `${artwork.artist.city}, ${artwork.artist.country}` 
                        : artwork.artist.country || ""}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Description */}
                <div>
                  <p className="label mb-4">À propos</p>
                  <p className="text-neutral-400 leading-relaxed">{artwork.description}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <p className="label mb-4">Détails</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Dimensions</p>
                      <p>
                        {Number(artwork.width)} × {Number(artwork.height)}
                        {artwork.depth ? ` × ${Number(artwork.depth)}` : ''} cm
                      </p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Année</p>
                      <p>{artwork.year}</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Technique</p>
                      <p>{artwork.medium}</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Édition</p>
                      <p>Œuvre unique</p>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="bg-neutral-900/50 p-8 space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm mb-1">Prix</p>
                      <p className="text-4xl font-light">€{Number(artwork.price).toLocaleString()}</p>
                    </div>
                    <p className="text-neutral-500 text-sm">TVA incluse</p>
                  </div>
                  
                  <AddToCartButton artwork={{
                    id: artwork.id,
                    slug: artwork.slug,
                    title: artwork.title,
                    price: Number(artwork.price),
                    image: images[0]?.url,
                    artistName: artwork.artist.user.name || "Artiste"
                  }} />
                  
                  <div className="flex items-center gap-3 pt-4 text-neutral-500 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Certificat d'authenticité inclus</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-neutral-500 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    <span>Livraison mondiale assurée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Works */}
        {similarArtworks.length > 0 && (
          <section className="py-24 border-t border-neutral-800">
            <div className="max-w-[1800px] mx-auto px-8 md:px-16">
              <div className="flex justify-between items-end mb-16">
                <div>
                  <p className="label text-gold mb-4">Explorer</p>
                  <h2 className="heading-sm">Œuvres similaires</h2>
                </div>
                <Link href="/catalogue" className="text-sm tracking-[0.15em] uppercase text-neutral-500 hover:text-white transition-colors">
                  Voir tout
                </Link>
              </div>
              
              <div className="grid md:grid-cols-4 gap-8">
                {similarArtworks.map((similar) => {
                  const similarImages = getImages(similar.images)
                  return (
                    <Link key={similar.id} href={`/oeuvre/${similar.slug}`} className="group">
                      <div className="img-zoom aspect-[3/4] bg-neutral-900 mb-4">
                        <img 
                          src={similarImages[0]?.url}
                          alt={similar.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-light group-hover:text-gold transition-colors">{similar.title}</h3>
                      <p className="text-neutral-500 text-sm">{similar.artist.user.name}</p>
                      <p className="mt-1">€{Number(similar.price).toLocaleString()}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
