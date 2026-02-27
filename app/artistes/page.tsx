import Link from "next/link"
import Image from "next/image"
import SafeImage from "@/components/ui/SafeImage"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"
import { getArtworkImageUrl } from "@/lib/image-utils"
import { Metadata } from "next"
import { getServerTranslation } from "@/lib/i18n-server"

// Métadonnées pour le SEO
export const metadata: Metadata = {
  title: "Nos Artistes",
  description: "Découvrez les artistes talentueux de la galerie ELFAKIR. Peintres, sculpteurs, photographes et créateurs d'art contemporain du monde entier.",
  keywords: ["artistes contemporains", "peintres", "sculpteurs", "photographes", "galerie ELFAKIR", "art moderne"],
  openGraph: {
    title: "Nos Artistes — ELFAKIR Gallery",
    description: "Découvrez les artistes talentueux de la galerie ELFAKIR. Peintres, sculpteurs, photographes et créateurs d'art contemporain du monde entier.",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nos Artistes — ELFAKIR Gallery",
    description: "Découvrez les artistes talentueux de la galerie ELFAKIR. Peintres, sculpteurs, photographes et créateurs d'art contemporain.",
    images: ["/og-image.jpg"],
  },
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
          select: {
            name: true,
            image: true
          }
        },
        artworks: {
          where: {
            status: "AVAILABLE"
          },
          take: 4,
          orderBy: {
            createdAt: "desc"
          }
        },
        _count: {
          select: {
            artworks: {
              where: {
                status: "AVAILABLE"
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return artists
  } catch (error) {
    console.error("Erreur récupération artistes:", error)
    return []
  }
}

export default async function ArtistesPage() {
  const t = getServerTranslation()
  const artists = await getArtists()

  return (
    <>
      <Header />
      <main id="main-content" className="bg-black text-white min-h-screen pt-28">
        {/* Hero Header */}
        <header className="pt-12 pb-20 border-b border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="label mb-4 text-gold">{t("artists.label")}</p>
                <h1 className="heading-xl">{t("artists.title")}</h1>
              </div>
              <p className="text-neutral-500 max-w-md">
                {t("artists.desc")}
              </p>
            </div>
          </div>
        </header>

        {/* Artists Grid */}
        <section className="py-20">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            {artists.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artiste/${artist.id}`}
                    className="group"
                  >
                    {/* Artist Card */}
                    <div className="border border-neutral-800 hover:border-neutral-600 transition-colors">
                      {/* Preview Images Grid */}
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {artist.artworks.slice(0, 4).map((artwork, i) => (
                          <div 
                            key={artwork.id} 
                            className="relative aspect-square bg-neutral-900 overflow-hidden"
                          >
                            <SafeImage
                              src={getArtworkImageUrl(artwork.images)}
                              alt={artwork.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 50vw, 200px"
                            />
                          </div>
                        ))}
                        {/* Fill empty slots if less than 4 artworks */}
                        {Array.from({ length: Math.max(0, 4 - artist.artworks.length) }).map((_, i) => (
                          <div 
                            key={`empty-${i}`} 
                            className="aspect-square bg-neutral-900"
                          />
                        ))}
                      </div>
                      
                      {/* Artist Info */}
                      <div className="p-6 border-t border-neutral-800">
                        <h3 className="text-xl font-light mb-2 group-hover:text-gold transition-colors">
                          {artist.user.name || "Artiste"}
                        </h3>
                        {artist.bio && (
                          <p className="text-neutral-500 text-sm line-clamp-2 mb-4">
                            {artist.bio}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500">
                            {t("artists.artworksAvailable").replace("{count}", String(artist._count.artworks)).replace("{plural}", artist._count.artworks > 1 ? "s" : "")}
                          </span>
                          <span className="text-gold group-hover:underline">
                            {t("artists.viewProfile")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-neutral-800">
                <p className="text-neutral-500 mb-4">
                  {t("artists.noArtists")}
                </p>
                <Link 
                  href="/catalogue" 
                  className="text-white underline hover:text-neutral-300"
                >
                  {t("about.viewCatalogue")}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 border-t border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 text-center">
            <h2 className="heading-md mb-6">{t("artists.areYouArtist")}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto mb-8">
              {t("artists.joinDesc")}
            </p>
            <Link
              href="/contact"
              className="inline-block border border-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all"
            >
              {t("about.contactUs")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
