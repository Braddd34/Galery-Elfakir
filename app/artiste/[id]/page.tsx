import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import FollowButton from "@/components/artist/FollowButton"
import SocialLinks from "@/components/artist/SocialLinks"
import ExhibitionsGallery from "@/components/artist/ExhibitionsGallery"
import ContactArtistButton from "@/components/artist/ContactArtistButton"
import prisma from "@/lib/prisma"
import { getServerTranslation } from "@/lib/i18n-server"
import { getArtworkImageUrl, getAvatarUrl } from "@/lib/image-utils"
import ArtistAvatar from "@/components/artist/ArtistAvatar"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const t = getServerTranslation()
  const artist = await getArtist(params.id)
  if (!artist) return { title: t("artistProfile.notFound") }
  
  const artistName = artist.user.name || "Artiste"
  const description = artist.bio 
    ? artist.bio.substring(0, 160) 
    : `Découvrez les œuvres de ${artistName} sur la galerie ELFAKIR.`
  const imageUrl = artist.user.image || "/og-image.jpg"
  
  return {
    title: artistName,
    description,
    openGraph: {
      title: `${artistName} — ELFAKIR Gallery`,
      description,
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
          alt: artistName,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${artistName} — ELFAKIR Gallery`,
      description,
      images: [imageUrl],
    },
  }
}

async function getArtist(id: string) {
  try {
    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
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
            slug: true,
            title: true,
            price: true,
            images: true,
            medium: true,
            year: true,
          }
        }
      }
    })
    if (artist && !artist.user) {
      console.error(`ArtistProfile ${id} has no associated user`)
      return null
    }
    return artist
  } catch (error) {
    console.error(`Error fetching artist ${id}:`, error)
    return null
  }
}

export default async function ArtistePage({ params }: { params: { id: string } }) {
  const t = getServerTranslation()
  const artist = await getArtist(params.id)

  if (!artist) {
    notFound()
  }

  const getImageUrl = (artwork: { images: unknown }) => getArtworkImageUrl(artwork.images)

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
        name: t("breadcrumbs.home"),
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("nav.artists"),
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
              <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbs.home")}</Link>
              <span>/</span>
              <Link href="/artistes" className="hover:text-white transition-colors">{t("nav.artists")}</Link>
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
                <div className="relative aspect-square bg-neutral-900 overflow-hidden">
                  <ArtistAvatar
                    src={getAvatarUrl(artist.user.image)}
                    alt={artist.user.name || "Artiste"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                  {t("artistProfile.artist")}
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

                {/* Bouton Suivre + Réseaux sociaux */}
                <div className="flex flex-wrap items-center gap-6 mb-8">
                  <FollowButton artistId={artist.id} />
                  <SocialLinks 
                    website={artist.website}
                    instagram={artist.instagram}
                    twitter={artist.twitter}
                    facebook={artist.facebook}
                    linkedin={artist.linkedin}
                  />
                </div>

                <div className="flex items-center gap-8 pt-6 border-t border-neutral-800">
                  <div>
                    <p className="text-3xl font-light">{artist.artworks.length}</p>
                    <p className="text-neutral-500 text-sm">
                      {t("artists.artworksAvailable").replace("{count}", String(artist.artworks.length)).replace("{plural}", artist.artworks.length > 1 ? "s" : "")}
                    </p>
                  </div>
                  
                  <ContactArtistButton 
                    artistUserId={artist.user.id} 
                    artistName={artist.user.name || "Artiste"} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expositions */}
        <section className="border-t border-neutral-800 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <ExhibitionsGallery artistId={artist.id} />
          </div>
        </section>

        {/* Artworks */}
        <section className="border-t border-neutral-800 py-16 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light mb-12">
              {t("artistProfile.worksBy") + " " + (artist.user.name || t("artistProfile.artist"))}
            </h2>

            {artist.artworks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artist.artworks.map((artwork) => (
                  <Link 
                    key={artwork.id}
                    href={`/oeuvre/${artwork.slug || artwork.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden mb-4">
                      <Image
                        src={getImageUrl(artwork)}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs tracking-[0.2em] uppercase text-neutral-500">
                        {artwork.medium} {artwork.year && `— ${artwork.year}`}
                      </p>
                      <h3 className="text-lg font-light group-hover:text-neutral-300 transition-colors">
                        {artwork.title}
                      </h3>
                      <p className="text-lg">{Number(artwork.price || 0).toLocaleString("fr-FR")} €</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-neutral-500">
                  {t("artistProfile.noWorks")}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t border-neutral-800 py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-light mb-4">
              {t("artistProfile.interested")}
            </h2>
            <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
              {t("artistProfile.interestedDesc")}
            </p>
            <Link
              href="/contact"
              className="inline-block border border-white px-8 py-4 text-sm tracking-wider hover:bg-white hover:text-black transition-all"
            >
              {t("about.contactUs").toUpperCase()}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
