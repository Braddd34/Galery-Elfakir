import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"

function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}

async function getArtistSales(userId: string) {
  const artistProfile = await prisma.artistProfile.findUnique({
    where: { userId },
    include: {
      artworks: {
        where: {
          status: "SOLD"
        },
        include: {
          order: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { soldAt: "desc" }
      }
    }
  })
  return {
    artworks: artistProfile?.artworks || [],
    totalSales: artistProfile?.totalSales || 0,
    totalRevenue: artistProfile?.totalRevenue || 0
  }
}

export default async function ArtistVentesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ARTIST") {
    redirect("/dashboard")
  }

  const { artworks, totalSales, totalRevenue } = await getArtistSales(session.user.id)

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
        <h1 className="text-3xl font-light mb-8">Mes ventes</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light">{totalSales}</p>
            <p className="text-neutral-500 text-sm mt-1">Œuvres vendues</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light">€{Number(totalRevenue).toLocaleString()}</p>
            <p className="text-neutral-500 text-sm mt-1">Revenus totaux</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light">30%</p>
            <p className="text-neutral-500 text-sm mt-1">Commission galerie</p>
          </div>
        </div>

        {/* Sales List */}
        <h2 className="text-xl font-light mb-6">Historique des ventes</h2>
        
        {artworks.length > 0 ? (
          <div className="space-y-4">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="bg-neutral-900 border border-neutral-800 p-6 flex gap-6 items-center"
              >
                <img
                  src={getImageUrl(artwork.images)}
                  alt={artwork.title}
                  className="w-20 h-20 object-cover bg-neutral-800"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-light mb-1">{artwork.title}</h3>
                  <p className="text-neutral-500 text-sm">
                    Vendu le {artwork.soldAt?.toLocaleDateString('fr-FR')}
                    {artwork.order?.user?.name && ` à ${artwork.order.user.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg">€{Number(artwork.price).toLocaleString()}</p>
                  <p className="text-neutral-500 text-sm">
                    Revenus: €{(Number(artwork.price) * 0.7).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-neutral-800">
            <p className="text-neutral-500">Aucune vente pour le moment</p>
          </div>
        )}
      </div>
    </main>
  )
}
