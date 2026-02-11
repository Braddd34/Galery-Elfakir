import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"
import { Metadata } from "next"

// Metadata dynamique
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true }
  })
  
  return {
    title: user ? `Favoris de ${user.name}` : "Wishlist",
    description: user 
      ? `Découvrez la sélection d'œuvres d'art de ${user.name} sur ELFAKIR Gallery.`
      : "Wishlist d'œuvres d'art",
  }
}

function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600"
  if (!images) return fallback
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}

async function getWishlist(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        favorites: {
          include: {
            artwork: {
              include: {
                artist: {
                  include: {
                    user: { select: { name: true } }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })
    return user
  } catch {
    return null
  }
}

export default async function WishlistPage({ params }: { params: { id: string } }) {
  const user = await getWishlist(params.id)
  
  if (!user) {
    return (
      <>
        <Header />
        <main className="bg-black text-white min-h-screen pt-32 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Utilisateur non trouvé</h1>
            <Link href="/" className="text-neutral-400 hover:text-white underline">
              Retour à l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }
  
  const availableFavorites = user.favorites.filter(
    fav => fav.artwork.status === "AVAILABLE"
  )
  
  return (
    <>
      <Header />
      <main className="bg-black text-white min-h-screen pt-32">
        {/* Hero */}
        <section className="py-12 text-center border-b border-neutral-800">
          <div className="max-w-3xl mx-auto px-6">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || ""}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
            )}
            <h1 className="text-3xl font-light mb-2">
              Sélection de {user.name}
            </h1>
            <p className="text-neutral-400">
              {availableFavorites.length} œuvre{availableFavorites.length > 1 ? "s" : ""} favorite{availableFavorites.length > 1 ? "s" : ""}
            </p>
          </div>
        </section>
        
        {/* Grille */}
        <section className="py-12">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            {availableFavorites.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {availableFavorites.map(({ artwork }) => (
                  <Link
                    key={artwork.id}
                    href={`/oeuvre/${artwork.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden mb-3">
                      <Image
                        src={getImageUrl(artwork.images)}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <h3 className="font-light group-hover:text-neutral-300 transition-colors">
                      {artwork.title}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                      {artwork.artist.user.name}
                    </p>
                    <p className="mt-1">€{Number(artwork.price).toLocaleString("fr-FR")}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-neutral-500 text-lg">
                  Aucun favori pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
