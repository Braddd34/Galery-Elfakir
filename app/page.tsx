import Link from "next/link"
import Image from "next/image"
import HomeHeader from "@/components/layout/HomeHeader"
import prisma from "@/lib/prisma"
import Recommendations from "@/components/artwork/Recommendations"
import { Metadata } from "next"

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
      "https://instagram.com/elfakir.gallery",
      "https://twitter.com/elfakirgallery"
    ]
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
              <p className="label mb-6 text-gold">Galerie d'art contemporain</p>
              <h1 className="heading-xl mb-8">
                L'Art<br />
                <span className="italic">Réinventé</span>
              </h1>
            </div>
            
            <div className="animate-fade-up-delay">
              <p className="text-lg text-neutral-400 max-w-md mb-8 leading-relaxed">
                Une collection exclusive d'œuvres originales, 
                sélectionnées avec passion auprès d'artistes 
                du monde entier.
              </p>
              <Link 
                href="/catalogue" 
                className="group inline-flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.15em] uppercase">Découvrir</span>
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
              <p className="label mb-4">Sélection</p>
              <h2 className="heading-lg">Œuvres à la une</h2>
            </div>
            <Link 
              href="/catalogue" 
              className="group inline-flex items-center gap-4 mt-8 md:mt-0"
            >
              <span className="text-sm tracking-[0.15em] uppercase text-neutral-400 group-hover:text-white transition-colors">
                Voir la collection
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
                Aucune œuvre disponible pour le moment.
              </p>
              <p className="text-neutral-600">
                Revenez bientôt pour découvrir notre collection.
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

      {/* Statement Section */}
      <section className="py-32 md:py-48 border-t border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="max-w-4xl">
            <p className="label mb-8 text-gold">Notre philosophie</p>
            <h2 className="text-elegant text-3xl md:text-5xl leading-relaxed text-neutral-300">
              "Nous croyons que l'art doit être accessible, 
              authentique et capable de transformer 
              n'importe quel espace en un lieu d'émotion 
              et de contemplation."
            </h2>
            <div className="mt-12 flex items-center gap-6">
              <div className="w-16 h-[1px] bg-gold" />
              <p className="text-neutral-500">Mehdi Elfakir, Fondateur</p>
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
                title: "Authenticité",
                description: "Chaque œuvre est accompagnée d'un certificat d'authenticité signé, garantissant son origine et sa valeur."
              },
              {
                number: "02",
                title: "Sécurité",
                description: "Transactions cryptées et paiements sécurisés via Stripe. Votre investissement est protégé."
              },
              {
                number: "03",
                title: "Livraison",
                description: "Expédition mondiale avec emballage professionnel et assurance complète incluse."
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

      {/* Artists CTA */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&h=800&fit=crop" 
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
        </div>
        <div className="relative max-w-[1800px] mx-auto px-8 md:px-16 text-center">
          <p className="label mb-6 text-gold">Pour les artistes</p>
          <h2 className="heading-lg mb-8 max-w-3xl mx-auto">
            Rejoignez notre<br />
            <span className="italic">communauté d'artistes</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-12 text-lg">
            Exposez vos œuvres à des collectionneurs du monde entier. 
            Commission transparente, paiements directs.
          </p>
          <Link 
            href="/register" 
            className="inline-block border border-white px-12 py-5 text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            Devenir partenaire
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
                Galerie d'art contemporain en ligne, dédiée à la promotion 
                d'artistes émergents et établis du monde entier.
              </p>
            </div>
            
            {/* Navigation */}
            <div>
              <p className="label mb-6">Navigation</p>
              <ul className="space-y-4">
                <li>
                  <Link href="/catalogue" className="text-neutral-400 hover:text-white transition-colors">
                    Collection
                  </Link>
                </li>
                <li>
                  <Link href="/artistes" className="text-neutral-400 hover:text-white transition-colors">
                    Artistes
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="text-neutral-400 hover:text-white transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <p className="label mb-6">Contact</p>
              <ul className="space-y-4 text-neutral-400">
                <li>contact@elfakir.art</li>
                <li>+33 1 23 45 67 89</li>
                <li className="pt-4">
                  <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="mt-20 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-600 text-sm">
              © {new Date().getFullYear()} Galerie ELFAKIR. Tous droits réservés.
            </p>
            <div className="flex gap-8 text-sm text-neutral-600">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
