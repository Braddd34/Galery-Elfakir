import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import prisma from "@/lib/prisma"
import { ArtworkCategory } from "@prisma/client"
import AddToCartButton from "@/components/cart/AddToCartButton"
import ViewTracker from "@/components/artwork/ViewTracker"
import ReviewSection from "@/components/reviews/ReviewSection"
import ContactArtistButton from "@/components/artist/ContactArtistButton"
import ShareButtons from "@/components/artwork/ShareButtons"
import ImageLightbox from "@/components/artwork/ImageLightbox"
import Recommendations from "@/components/artwork/Recommendations"
import { getArtworkImages } from "@/lib/image-utils"
import { Metadata } from "next"
import { getServerTranslation } from "@/lib/i18n-server"

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
    const t = getServerTranslation()
    return {
      title: t("artwork.notFound")
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

const getImages = getArtworkImages

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
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })
    
    return artwork
  } catch (error) {
    console.error("Erreur récupération œuvre:", error)
    return null
  }
}

// Récupérer les avis pour le JSON-LD (données structurées SEO)
async function getReviewStats(artworkId: string) {
  try {
    const [reviews, stats] = await Promise.all([
      prisma.review.findMany({
        where: { artworkId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.review.aggregate({
        where: { artworkId },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ])
    return {
      reviews,
      avgRating: stats._avg.rating || 0,
      count: stats._count.rating || 0
    }
  } catch {
    return { reviews: [], avgRating: 0, count: 0 }
  }
}

export default async function ArtworkPage({ params }: { params: { slug: string } }) {
  const t = getServerTranslation()

  const categoryLabels: Record<ArtworkCategory, string> = {
    PAINTING: t("catalogue.category.painting"),
    SCULPTURE: t("catalogue.category.sculpture"),
    PHOTOGRAPHY: t("catalogue.category.photography"),
    DRAWING: t("catalogue.category.drawing"),
    PRINT: t("catalogue.category.print"),
    DIGITAL: t("catalogue.category.digital"),
    MIXED_MEDIA: t("catalogue.category.mixedMedia"),
    OTHER: t("catalogue.category.other")
  }

  const artwork = await getArtwork(params.slug)
  
  if (!artwork) {
    notFound()
  }
  
  const images = getImages(artwork.images)
  const artistName = artwork.artist.user.name || "Artiste"
  const baseUrl = "https://galeryelfakir.vercel.app"
  
  // Récupérer les stats d'avis pour le JSON-LD
  const reviewData = await getReviewStats(artwork.id)

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
    },
    // Avis structurés pour Google Rich Snippets (étoiles dans les résultats)
    ...(reviewData.count > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewData.avgRating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        ratingCount: reviewData.count
      },
      review: reviewData.reviews.slice(0, 5).map(r => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: r.user.name || "Anonyme"
        },
        datePublished: r.createdAt.toISOString().split("T")[0],
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: "5"
        },
        ...(r.title ? { name: r.title } : {}),
        ...(r.comment ? { reviewBody: r.comment } : {})
      }))
    } : {})
  }

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("breadcrumbs.home"),
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("artwork.collection"),
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
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: "Catalogue", href: "/catalogue" },
          { label: categoryLabels[artwork.category], href: `/catalogue?category=${artwork.category.toLowerCase()}` },
          { label: artwork.title }
        ]} />

        {/* Main Content */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="grid lg:grid-cols-12 gap-16">
              
              {/* Left: Images avec zoom */}
              <div className="lg:col-span-7">
                <ImageLightbox images={images} alt={artwork.title} />
              </div>

              {/* Right: Info */}
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-10">
                
                {/* Header */}
                <div>
                  <p className="label text-gold mb-4">
                    {categoryLabels[artwork.category]} — {artwork.year}
                  </p>
                  {artwork.earlyAccessUntil && new Date(artwork.earlyAccessUntil) > new Date() && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 mb-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Avant-première VIP
                    </span>
                  )}
                  <h1 className="heading-md mb-2">{artwork.title}</h1>
                  <p className="text-neutral-500 text-lg mb-4">{artwork.medium}</p>
                  
                  {/* Partage */}
                  <ShareButtons
                    title={artwork.title}
                    url={`/oeuvre/${artwork.slug}`}
                    description={`${artwork.title} par ${artistName} - €${Number(artwork.price).toLocaleString()}`}
                    imageUrl={images[0]?.url}
                  />
                </div>

                {/* Artist */}
                <Link 
                  href={`/artiste/${artwork.artistId}`}
                  className="flex items-center gap-5 py-6 border-y border-neutral-800 group"
                >
                  <Image 
                    src={artwork.artist.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"} 
                    alt={artwork.artist.user.name || "Artiste"}
                    width={64}
                    height={64}
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
                  <p className="label mb-4">{t("artwork.about")}</p>
                  <p className="text-neutral-400 leading-relaxed">{artwork.description}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <p className="label mb-4">{t("artwork.details")}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">{t("artwork.dimensions")}</p>
                      <p>
                        {Number(artwork.width)} × {Number(artwork.height)}
                        {artwork.depth ? ` × ${Number(artwork.depth)}` : ''} cm
                      </p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">{t("artwork.year")}</p>
                      <p>{artwork.year}</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">{t("artwork.technique")}</p>
                      <p>{artwork.medium}</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">{t("artwork.edition")}</p>
                      <p>{t("artwork.uniqueWork")}</p>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="bg-neutral-900/50 p-8 space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm mb-1">{t("artwork.price")}</p>
                      <p className="text-4xl font-light">€{Number(artwork.price).toLocaleString()}</p>
                    </div>
                    <p className="text-neutral-500 text-sm">{t("artwork.vatIncluded")}</p>
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
                    <span>{t("artwork.certificateIncluded")}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-neutral-500 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    <span>{t("artwork.shippingIncluded")}</span>
                  </div>
                  
                  {/* Contact artiste */}
                  <div className="pt-4 border-t border-neutral-800">
                    <ContactArtistButton 
                      artistUserId={artwork.artist.user.id}
                      artistName={artwork.artist.user.name || "Artiste"}
                      artworkId={artwork.id}
                      artworkTitle={artwork.title}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Reviews Section */}
        <section className="py-16 border-t border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <ReviewSection artworkId={artwork.id} />
          </div>
        </section>
        
        {/* View Tracker */}
        <ViewTracker artworkId={artwork.id} />

        {/* Recommandations personnalisées "Vous aimerez aussi" */}
        <section className="py-24 border-t border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <Recommendations artworkId={artwork.id} limit={4} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
