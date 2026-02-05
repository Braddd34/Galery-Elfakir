import Link from "next/link"
import prisma from "@/lib/prisma"
import ArtworksTable from "@/components/admin/ArtworksTable"

async function getArtworks() {
  const artworks = await prisma.artwork.findMany({
    include: {
      artist: {
        include: {
          user: {
            select: {
              name: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
  return artworks
}

export default async function AdminOeuvresPage() {
  const artworks = await getArtworks()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light">Œuvres</h1>
          <p className="text-neutral-500 mt-1">
            Gérez les œuvres de la galerie
          </p>
        </div>
        <Link
          href="/admin/oeuvres/new"
          className="bg-white text-black px-6 py-3 text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          + Ajouter une œuvre
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-2xl font-light">{artworks.length}</p>
          <p className="text-neutral-500 text-sm">Total</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-2xl font-light text-green-500">
            {artworks.filter(a => a.status === "AVAILABLE").length}
          </p>
          <p className="text-neutral-500 text-sm">Disponibles</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-2xl font-light text-yellow-500">
            {artworks.filter(a => a.status === "PENDING").length}
          </p>
          <p className="text-neutral-500 text-sm">En attente</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-2xl font-light text-purple-500">
            {artworks.filter(a => a.status === "SOLD").length}
          </p>
          <p className="text-neutral-500 text-sm">Vendues</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-2xl font-light text-neutral-500">
            {artworks.filter(a => a.status === "DRAFT").length}
          </p>
          <p className="text-neutral-500 text-sm">Brouillons</p>
        </div>
      </div>

      {/* Table */}
      <ArtworksTable artworks={artworks as any} />
    </div>
  )
}
