"use client"

import Link from "next/link"
import StatusDropdown from "./StatusDropdown"

interface Artwork {
  id: string
  title: string
  category: string
  status: string
  price: any
  slug: string
  images: any
  artist: {
    user: {
      name: string | null
    }
  }
}

interface ArtworksTableProps {
  artworks: Artwork[]
}

const categoryLabels: Record<string, string> = {
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
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed?.[0]?.url || ""
  } catch {
    return ""
  }
}

export default function ArtworksTable({ artworks }: ArtworksTableProps) {
  if (artworks.length === 0) {
    return (
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
    )
  }

  return (
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
            const imageUrl = getImageUrl(artwork.images)

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
                      <p className="text-neutral-500 text-sm">
                        {categoryLabels[artwork.category] || artwork.category}
                      </p>
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
                  <StatusDropdown 
                    artworkId={artwork.id} 
                    currentStatus={artwork.status} 
                  />
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
                    <Link
                      href={`/certificat/${artwork.id}`}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                      target="_blank"
                    >
                      Certificat
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
