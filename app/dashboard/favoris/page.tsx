import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"

function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}

async function getUserFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      artwork: {
        include: {
          artist: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })
  return favorites
}

export default async function MesFavorisPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const favorites = await getUserFavorites(session.user.id)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Mes favoris</h1>

        {favorites.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((fav) => (
              <Link
                key={fav.id}
                href={`/oeuvre/${fav.artwork.slug}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-neutral-900 mb-4 overflow-hidden">
                  <img
                    src={getImageUrl(fav.artwork.images)}
                    alt={fav.artwork.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-light group-hover:text-neutral-300 transition-colors">
                  {fav.artwork.title}
                </h3>
                <p className="text-neutral-500 text-sm">{fav.artwork.artist.user.name}</p>
                <p className="mt-1">€{Number(fav.artwork.price).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-neutral-800">
            <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-neutral-500 mb-4">Vous n'avez pas encore de favoris</p>
            <Link href="/catalogue" className="text-white underline hover:text-neutral-300">
              Découvrir le catalogue
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
