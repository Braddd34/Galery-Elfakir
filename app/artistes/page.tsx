import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Artistes",
  description: "Découvrez nos artistes talentueux",
}

async function getArtists() {
  const artists = await prisma.artistProfile.findMany({
    where: {
      user: {
        status: "ACTIVE"
      }
    },
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
        take: 1,
        select: {
          images: true,
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
    }
  })
  return artists
}

export default async function ArtistesPage() {
  const artists = await getArtists()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              Nos Artistes
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl">
              Découvrez les artistes talentueux qui exposent leurs œuvres 
              dans notre galerie. Chacun apporte une vision unique et personnelle.
            </p>
          </div>
        </section>

        {/* Artists Grid */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            {artists.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artists.map((artist) => {
                  const firstArtwork = artist.artworks[0]
                  let imageUrl = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600"
                  
                  if (firstArtwork && firstArtwork.images) {
                    try {
                      const images = typeof firstArtwork.images === 'string' 
                        ? JSON.parse(firstArtwork.images) 
                        : firstArtwork.images
                      if (images[0]?.url) imageUrl = images[0].url
                    } catch (e) {}
                  }

                  return (
                    <Link 
                      key={artist.id} 
                      href={`/artiste/${artist.id}`}
                      className="group"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-neutral-900 mb-4">
                        <img
                          src={imageUrl}
                          alt={artist.user.name || "Artiste"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="text-xl font-light mb-1">
                        {artist.user.name}
                      </h3>
                      <p className="text-neutral-500 text-sm">
                        {artist.city && artist.country 
                          ? `${artist.city}, ${artist.country}` 
                          : artist.country || ""}
                      </p>
                      <p className="text-neutral-600 text-sm mt-1">
                        {artist._count.artworks} œuvre{artist._count.artworks > 1 ? 's' : ''} disponible{artist._count.artworks > 1 ? 's' : ''}
                      </p>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-neutral-500 text-lg">
                  Aucun artiste pour le moment.
                </p>
                <p className="text-neutral-600 mt-2">
                  Revenez bientôt pour découvrir nos artistes.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-800 py-24 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Vous êtes artiste ?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Rejoignez notre galerie et exposez vos œuvres à une audience 
              internationale de collectionneurs passionnés.
            </p>
            <Link
              href="/register?role=artist"
              className="inline-block border border-white px-8 py-4 text-sm tracking-wider hover:bg-white hover:text-black transition-all"
            >
              DEVENIR ARTISTE
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
