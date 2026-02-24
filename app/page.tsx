import Link from "next/link"
import Image from "next/image"
import HomeHeader from "@/components/layout/HomeHeader"
import prisma from "@/lib/prisma"
import Recommendations from "@/components/artwork/Recommendations"
import { Metadata } from "next"
import { getServerTranslation } from "@/lib/i18n-server"
import { SOCIAL_LINKS } from "@/lib/constants"

// Métadonnées SEO pour la page d'accueil
export const metadata: Metadata = {
  title: "ELFAKIR — Galerie d'Art Contemporain en Ligne",
  description: "Découvrez une collection exclusive d'œuvres d'art originales. Peintures, sculptures, photographies d'artistes contemporains internationaux. Livraison sécurisée et certificat d'authenticité.",
  keywords: ["galerie d'art", "art contemporain", "œuvres originales", "peinture", "sculpture", "photographie", "acheter art en ligne", "artistes contemporains"],
  openGraph: {
    title: "ELFAKIR — Galerie d'Art Contemporain",
    description: "Découvrez une collection exclusive d'œuvres d'art originales d'artistes contemporains internationaux.",
    type: "website",
    locale: "fr_FR",
    siteName: "ELFAKIR Gallery",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ELFAKIR Gallery - Art Contemporain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELFAKIR — Galerie d'Art Contemporain",
    description: "Découvrez une collection exclusive d'œuvres d'art originales d'artistes contemporains internationaux.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://galeryelfakir.vercel.app",
  },
}

// Helper pour extraire l'URL de l'image depuis le JSON
function getImageUrl(images: any, index: number = 0): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[index]?.url || fallback
  } catch {
    return fallback
  }
}

// Récupérer les œuvres à la une depuis la DB
async function getFeaturedArtworks() {
  try {
    const artworks = await prisma.artwork.findMany({
      where: {
        status: "AVAILABLE"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 3,
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

export default async function HomePage() {
  const featuredArtworks = await getFeaturedArtworks()
  const t = getServerTranslation()
  
  // Image de fond : première œuvre ou fallback
  const heroImage = featuredArtworks[0] 
    ? getImageUrl(featuredArtworks[0].images) 
    : "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&h=1080&fit=crop"

  const baseUrl = "https://galeryelfakir.vercel.app"

  // JSON-LD pour la galerie (Organization + ArtGallery)
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ArtGallery"],
    name: "ELFAKIR Gallery",
    alternateName: "Galerie ELFAKIR",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Galerie d'art contemporain en ligne. Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Mehdi Elfakir"
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR"
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@elfakir.art",
      telephone: "+33 1 23 45 67 89",
      availableLanguage: ["French", "English"]
    },
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.twitter,
      SOCIAL_LINKS.tiktok,
    ].filter(Boolean)
  }

  // JSON-LD pour le site web
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ELFAKIR Gallery",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/catalogue?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <main id="main-content" className="bg-black text-white min-h-screen">
      {/* JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      
      {/* Navigation */}
      <HomeHeader />

      {/* Hero Section - Full Screen */}
      <section className="h-screen relative flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src={heroImage}
            alt="Œuvre mise en avant"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-[1800px] mx-auto px-8 md:px-16 pb-24 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div className="animate-fade-up">
              <p className="label mb-6 text-gold">{t("home.heroLabel")}</p>
              <h1 className="heading-xl mb-8">
                {t("home.heroTitle1")}<br />
                <span className="italic">{t("home.heroTitle2")}</span>
              </h1>
            </div>
            
            <div className="animate-fade-up-delay">
              <p className="text-lg text-neutral-400 max-w-md mb-8 leading-relaxed">
                {t("home.heroDesc")}
              </p>
              <Link 
                href="/catalogue" 
                className="group inline-flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.15em] uppercase">{t("home.discover")}</span>
                <span className="w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-500" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in">
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-500 to-transparent" />
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-32 md:py-48">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
            <div>
              <p className="label mb-4">{t("home.selectionLabel")}</p>
              <h2 className="heading-lg">{t("home.featuredTitle")}</h2>
            </div>
            <Link 
              href="/catalogue" 
              className="group inline-flex items-center gap-4 mt-8 md:mt-0"
            >
              <span className="text-sm tracking-[0.15em] uppercase text-neutral-400 group-hover:text-white transition-colors">
                {t("home.viewCollection")}
              </span>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-white group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {/* Artworks Grid - Asymmetric */}
          {featuredArtworks.length > 0 ? (
            <div className="grid md:grid-cols-12 gap-6 md:gap-8">
              {/* Large Featured - First artwork */}
              {featuredArtworks[0] && (
                <Link href={`/oeuvre/${featuredArtworks[0].slug}`} className="md:col-span-7 group">
                  <div className="relative img-zoom aspect-[4/5] md:aspect-[3/4] bg-neutral-900">
                    <Image
                      src={getImageUrl(featuredArtworks[0].images)}
                      alt={featuredArtworks[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 58vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  </div>
                  <div className="mt-6 flex justify-between items-start">
                    <div>
                      <h3 className="heading-sm mb-2 group-hover:text-gold transition-colors">
                        {featuredArtworks[0].title}
                      </h3>
                      <p className="text-neutral-500">{featuredArtworks[0].artist.user.name}</p>
                    </div>
                    <p className="text-lg">€{Number(featuredArtworks[0].price).toLocaleString()}</p>
                  </div>
                </Link>
              )}
              
              {/* Stacked Right - Other artworks */}
              <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
                {featuredArtworks.slice(1, 3).map((artwork) => (
                  <Link key={artwork.id} href={`/oeuvre/${artwork.slug}`} className="group">
                    <div className="relative img-zoom aspect-[4/3] bg-neutral-900">
                      <Image
                        src={getImageUrl(artwork.images)}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 42vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                    <div className="mt-6 flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-light group-hover:text-gold transition-colors">
                          {artwork.title}
                        </h3>
                        <p className="text-neutral-500 text-sm mt-1">{artwork.artist.user.name}</p>
                      </div>
                      <p>€{Number(artwork.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            // Message si pas d'œuvres
            <div className="text-center py-24 border border-neutral-800">
              <p className="text-neutral-500 text-lg mb-4">
                {t("home.noArtworks")}
              </p>
              <p className="text-neutral-600">
                {t("home.noArtworksDesc")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Recommandations personnalisées */}
      <section className="py-24 border-t border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <Recommendations limit={8} />
        </div>
      </section>

      {/* Virtual Exhibitions Section */}
      <section className="py-24 md:py-32 border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-500 mb-4">{t("home.newLabel") || "Nouveau"}</p>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight">Expositions Virtuelles</h2>
              <p className="text-neutral-400 mt-4 max-w-xl">
                Explorez nos galeries en 3D. Naviguez librement dans des espaces immersifs et découvrez les œuvres comme dans un vrai musée.
              </p>
            </div>
            <Link
              href="/expositions-virtuelles"
              className="mt-8 md:mt-0 inline-flex items-center gap-2 text-sm text-white hover:text-amber-500 transition-colors group"
            >
              Voir toutes les expositions
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-neutral-800 bg-black">
            <div className="aspect-[21/9] relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-black/80" />
              <div className="relative z-10 text-center px-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="text-xs uppercase tracking-[0.3em] text-amber-500">Visite immersive</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-light text-white mb-4">Entrez dans la galerie</h3>
                <p className="text-neutral-400 text-sm md:text-base mb-8 max-w-md mx-auto">
                  Navigation libre en 3D · Cliquez sur les œuvres · Achetez directement
                </p>
                <Link
                  href="/expositions-virtuelles"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-medium rounded transition-colors"
                >
                  Explorer les expositions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statement Section */}
      <section className="py-32 md:py-48 border-t border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="max-w-4xl">
            <p className="label mb-8 text-gold">{t("home.philosophyLabel")}</p>
            <h2 className="text-elegant text-3xl md:text-5xl leading-relaxed text-neutral-300">
              {t("home.philosophyQuote")}
            </h2>
            <div className="mt-12 flex items-center gap-6">
              <div className="w-16 h-[1px] bg-gold" />
              <p className="text-neutral-500">{t("home.philosophyAuthor")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 md:py-48 bg-neutral-950">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-3 gap-px bg-neutral-800">
            {[
              {
                number: "01",
                title: t("home.service1Title"),
                description: t("home.service1Desc")
              },
              {
                number: "02",
                title: t("home.service2Title"),
                description: t("home.service2Desc")
              },
              {
                number: "03",
                title: t("home.service3Title"),
                description: t("home.service3Desc")
              }
            ].map((service) => (
              <div key={service.number} className="bg-neutral-950 p-12 md:p-16">
                <span className="text-gold text-sm">{service.number}</span>
                <h3 className="heading-sm mt-6 mb-4">{service.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-24 md:py-32 bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-7 h-7 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Suivez-nous sur Instagram</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
              @elfakir.gallery
            </h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              Découvrez nos dernières acquisitions, coulisses et événements
            </p>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop", alt: "Peinture abstraite colorée" },
              { src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=600&fit=crop", alt: "Sculpture contemporaine" },
              { src: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=600&fit=crop", alt: "Art moderne en galerie" },
              { src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=600&fit=crop", alt: "Œuvre d'art murale" },
              { src: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=600&fit=crop", alt: "Exposition d'art contemporain" },
              { src: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=600&h=600&fit=crop", alt: "Atelier d'artiste" },
            ].map((img, i) => (
              <a
                key={i}
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-neutral-900"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-black px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium hover:from-amber-600 hover:to-yellow-500 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Voir plus sur Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Artists CTA */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&h=800&fit=crop" 
            alt="Arrière-plan artistique décoratif"
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
        </div>
        <div className="relative max-w-[1800px] mx-auto px-8 md:px-16 text-center">
          <p className="label mb-6 text-gold">{t("home.artistsLabel")}</p>
          <h2 className="heading-lg mb-8 max-w-3xl mx-auto">
            {t("home.artistsTitle1")}<br />
            <span className="italic">{t("home.artistsTitle2")}</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-12 text-lg">
            {t("home.artistsDesc")}
          </p>
          <Link 
            href="/register" 
            className="inline-block border border-white px-12 py-5 text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            {t("home.becomePartner")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-20">
          <div className="grid md:grid-cols-4 gap-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <h2 className="text-3xl tracking-[0.3em] font-light mb-6">ELFAKIR</h2>
              <p className="text-neutral-500 max-w-sm leading-relaxed">
                {t("home.footerDesc")}
              </p>
            </div>
            
            {/* Navigation */}
            <div>
              <p className="label mb-6">{t("home.footerNav")}</p>
              <ul className="space-y-4">
                <li>
                  <Link href="/catalogue" className="text-neutral-400 hover:text-white transition-colors">
                    {t("home.footerCollection")}
                  </Link>
                </li>
                <li>
                  <Link href="/artistes" className="text-neutral-400 hover:text-white transition-colors">
                    {t("home.footerArtists")}
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="text-neutral-400 hover:text-white transition-colors">
                    {t("home.footerAbout")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                    {t("home.footerContact")}
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <p className="label mb-6">{t("home.footerContactLabel")}</p>
              <ul className="space-y-4 text-neutral-400">
                <li>contact@elfakir.art</li>
                <li>+33 1 23 45 67 89</li>
                <li className="pt-4">
                  <div className="flex gap-6">
                    <a href={SOCIAL_LINKS.instagram} className="hover:text-white transition-colors">Instagram</a>
                    <a href={SOCIAL_LINKS.twitter} className="hover:text-white transition-colors">Twitter</a>
                    <a href={SOCIAL_LINKS.tiktok} className="hover:text-white transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.51a8.27 8.27 0 004.76 1.5v-3.45a4.83 4.83 0 01-1-.13z"/>
                      </svg>
                      TikTok
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="mt-20 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-600 text-sm">
              © {new Date().getFullYear()} Galerie ELFAKIR. {t("home.footerRights")}
            </p>
            <div className="flex gap-8 text-sm text-neutral-600">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">{t("home.footerLegal")}</Link>
              <Link href="/cgv" className="hover:text-white transition-colors">{t("home.footerTerms")}</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">{t("home.footerPrivacy")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
