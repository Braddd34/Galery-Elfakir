import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id)
  if (!artist) return { title: "Artiste non trouvé" }
  
  return {
    title: artist.user.name,
    description: artist.bio || `Découvrez les œuvres de ${artist.user.name}`,
  }
}

async function getArtist(id: string) {
  try {
    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        },
        artworks: {
          where: {
            status: "AVAILABLE"
          },
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            medium: true,
            year: true,
          }
        }
      }
    })
    return artist
  } catch (error) {
    return null
  }
}

export default async function ArtistePage({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id)

  if (!artist) {
    notFound()
  }

  // Parse les images de l'artiste
  const getImageUrl = (artwork: any) => {
    if (artwork.images) {
      try {
        const images = typeof artwork.images === 'string' 
          ? JSON.parse(artwork.images) 
          : artwork.images
        if (images[0]?.url) return images[0].url
      } catch (e) {}
    }
    return "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
  }

  const baseUrl = "https://galeryelfakir.vercel.app"
  const artistName = artist.user.name || "Artiste"

  // JSON-LD pour l'artiste (Person)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artistName,
    url: `${baseUrl}/artiste/${artist.id}`,
    image: artist.user.image || undefined,
    description: artist.bio || undefined,
    jobTitle: "Artiste",
    worksFor: {
      "@type": "Organization",
      name: "ELFAKIR Gallery",
      url: baseUrl
    },
    address: artist.city && artist.country ? {
      "@type": "PostalAddress",
      addressLocality: artist.city,
      addressCountry: artist.country
    } : undefined,
    sameAs: [
      artist.website,
      artist.instagram ? `https://instagram.com/${artist.instagram.replace('@', '')}` : undefined
    ].filter(Boolean)
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
        name: "Artistes",
        item: `${baseUrl}/artistes`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: artistName,
        item: `${baseUrl}/artiste/${artist.id}`
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
      <main id="main-content" className="min-h-screen bg-black text-white pt-28">
        {/* Breadcrumb */}
        <div className="border-b border-neutral-800/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <nav className="flex items-center gap-3 text-sm text-neutral-500">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/artistes" className="hover:text-white transition-colors">Artistes</Link>
              <span>/</span>
              <span className="text-white">{artist.user.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Photo */}
              <div className="lg:col-span-1">
                <div className="aspect-square bg-neutral-900 overflow-hidden">
                  <img
                    src={artist.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"}
                    alt={artist.user.name || "Artiste"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                  Artiste
                </p>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                  {artist.user.name}
                </h1>
                
                {(artist.city || artist.country) && (
                  <p className="text-neutral-400 text-lg mb-6">
                    {artist.city && artist.country 
                      ? `${artist.city}, ${artist.country}` 
                      : artist.country || artist.city}
                  </p>
                )}

                {artist.bio && (
                  <p className="text-neutral-400 leading-relaxed max-w-2xl mb-8">
                    {artist.bio}
                  </p>
                )}

                <div className="flex items-center gap-8 pt-6 border-t border-neutral-800">
                  <div>
                    <p className="text-3xl font-light">{artist.artworks.length}</p>
                    <p className="text-neutral-500 text-sm">
                      Œuvre{artist.artworks.length > 1 ? 's' : ''} disponible{artist.artworks.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {artist.website && (
                    <a 
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 hover:text-white transition-colors underline"
                    >
                      Site web
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artworks */}
        <section className="border-t border-neutral-800 py-16 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light mb-12">
              Œuvres de {artist.user.name}
            </h2>

            {artist.artworks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artist.artworks.map((artwork) => (
                  <Link 
                    key={artwork.id}
                    href={`/oeuvre/${artwork.id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-neutral-900 overflow-hidden mb-4">
                      <img
                        src={getImageUrl(artwork)}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs tracking-[0.2em] uppercase text-neutral-500">
                        {artwork.medium} {artwork.year && `— ${artwork.year}`}
                      </p>
                      <h3 className="text-lg font-light group-hover:text-neutral-300 transition-colors">
                        {artwork.title}
                      </h3>
                      <p className="text-lg">€{artwork.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-neutral-500">
                  Aucune œuvre disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t border-neutral-800 py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-light mb-4">
              Intéressé par cet artiste ?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
              Contactez-nous pour plus d'informations sur les œuvres disponibles 
              ou pour organiser une visite privée.
            </p>
            <Link
              href="/contact"
              className="inline-block border border-white px-8 py-4 text-sm tracking-wider hover:bg-white hover:text-black transition-all"
            >
              NOUS CONTACTER
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
