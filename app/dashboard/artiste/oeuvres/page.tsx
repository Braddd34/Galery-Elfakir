import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { ArtworkStatus, ArtworkCategory } from "@prisma/client"

const statusLabels: Record<ArtworkStatus, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "bg-neutral-500" },
  PENDING: { label: "En attente", color: "bg-yellow-500" },
  AVAILABLE: { label: "Disponible", color: "bg-green-500" },
  RESERVED: { label: "Réservé", color: "bg-blue-500" },
  SOLD: { label: "Vendu", color: "bg-purple-500" },
  ARCHIVED: { label: "Archivé", color: "bg-neutral-700" },
}

const categoryLabels: Record<ArtworkCategory, string> = {
  PAINTING: "Peinture",
  SCULPTURE: "Sculpture",
  PHOTOGRAPHY: "Photographie",
  DRAWING: "Dessin",
  PRINT: "Estampe",
  DIGITAL: "Art numérique",
  MIXED_MEDIA: "Technique mixte",
  OTHER: "Autre"
}

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

async function getArtistArtworks(userId: string) {
  const artistProfile = await prisma.artistProfile.findUnique({
    where: { userId },
    include: {
      artworks: {
        orderBy: { createdAt: "desc" }
      }
    }
  })
  return artistProfile?.artworks || []
}

export default async function ArtistOeuvresPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ARTIST") {
    redirect("/dashboard")
  }

  const artworks = await getArtistArtworks(session.user.id)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light mb-2">Mes œuvres</h1>
            <p className="text-neutral-500">{artworks.length} œuvre{artworks.length > 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/dashboard/artiste/oeuvres/new"
            className="bg-white text-black px-6 py-3 text-sm tracking-wider hover:bg-neutral-200 transition-colors"
          >
            + Ajouter une œuvre
          </Link>
        </div>

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
                  className="w-24 h-24 object-cover bg-neutral-800"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-light">{artwork.title}</h3>
                    <span className={`px-2 py-1 text-xs ${statusLabels[artwork.status].color}`}>
                      {statusLabels[artwork.status].label}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-sm">
                    {categoryLabels[artwork.category]} • {artwork.year} • €{Number(artwork.price).toLocaleString()}
                  </p>
                  <p className="text-neutral-600 text-sm mt-1">
                    {artwork.views} vues
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/oeuvre/${artwork.slug}`}
                    className="px-4 py-2 border border-neutral-700 text-sm hover:border-white transition-colors"
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/dashboard/artiste/oeuvres/${artwork.id}/edit`}
                    className="px-4 py-2 border border-neutral-700 text-sm hover:border-white transition-colors"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-neutral-800">
            <p className="text-neutral-500 mb-4">Vous n'avez pas encore d'œuvres</p>
            <Link
              href="/dashboard/artiste/oeuvres/new"
              className="text-white underline hover:text-neutral-300"
            >
              Ajouter votre première œuvre
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
