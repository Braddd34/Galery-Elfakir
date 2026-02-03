import Link from "next/link"
import prisma from "@/lib/prisma"

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

  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Brouillon", color: "text-neutral-500" },
    PENDING: { label: "En attente", color: "text-yellow-500" },
    AVAILABLE: { label: "Disponible", color: "text-green-500" },
    RESERVED: { label: "Réservée", color: "text-blue-500" },
    SOLD: { label: "Vendue", color: "text-purple-500" },
    ARCHIVED: { label: "Archivée", color: "text-neutral-600" },
  }

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
      {artworks.length > 0 ? (
        <div className="border border-neutral-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Œuvre
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Artiste
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Prix
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Statut
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {artworks.map((artwork) => {
                let imageUrl = ""
                try {
                  const images = typeof artwork.images === 'string' 
                    ? JSON.parse(artwork.images) 
                    : artwork.images
                  if (images[0]?.url) imageUrl = images[0].url
                } catch (e) {}

                return (
                  <tr key={artwork.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {imageUrl && (
                          <div className="w-12 h-12 bg-neutral-800 overflow-hidden flex-shrink-0">
                            <img 
                              src={imageUrl} 
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{artwork.title}</p>
                          <p className="text-neutral-500 text-sm">{artwork.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {artwork.artist.user.name}
                    </td>
                    <td className="px-6 py-4">
                      {Number(artwork.price).toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusLabels[artwork.status]?.color}>
                        {statusLabels[artwork.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/oeuvres/${artwork.id}`}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          Modifier
                        </Link>
                        <Link
                          href={`/oeuvre/${artwork.slug}`}
                          className="text-sm text-neutral-500 hover:text-white transition-colors"
                          target="_blank"
                        >
                          Voir
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-neutral-800 p-12 text-center">
          <p className="text-neutral-500 mb-4">
            Aucune œuvre pour le moment
          </p>
          <Link
            href="/admin/oeuvres/new"
            className="inline-block border border-white px-6 py-3 text-sm hover:bg-white hover:text-black transition-all"
          >
            Ajouter la première œuvre
          </Link>
        </div>
      )}
    </div>
  )
}
