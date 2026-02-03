import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { UserStatus } from "@prisma/client"

const statusLabels: Record<UserStatus, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500" },
  ACTIVE: { label: "Actif", color: "bg-green-500" },
  SUSPENDED: { label: "Suspendu", color: "bg-red-500" },
  DELETED: { label: "Supprimé", color: "bg-neutral-500" },
}

async function getAllArtists() {
  const artists = await prisma.user.findMany({
    where: { role: "ARTIST" },
    orderBy: { createdAt: "desc" },
    include: {
      artistProfile: {
        include: {
          _count: {
            select: { artworks: true }
          }
        }
      }
    }
  })
  return artists
}

async function getArtistStats() {
  const [total, pending, active] = await Promise.all([
    prisma.user.count({ where: { role: "ARTIST" } }),
    prisma.user.count({ where: { role: "ARTIST", status: "PENDING" } }),
    prisma.user.count({ where: { role: "ARTIST", status: "ACTIVE" } })
  ])
  return { total, pending, active }
}

export default async function AdminArtistesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [artists, stats] = await Promise.all([
    getAllArtists(),
    getArtistStats()
  ])

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
        <h1 className="text-3xl font-light mb-8">Gestion des artistes</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light">{stats.total}</p>
            <p className="text-neutral-500 text-sm mt-1">Total artistes</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light text-yellow-500">{stats.pending}</p>
            <p className="text-neutral-500 text-sm mt-1">En attente de validation</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light text-green-500">{stats.active}</p>
            <p className="text-neutral-500 text-sm mt-1">Actifs</p>
          </div>
        </div>

        {/* Artists List */}
        {artists.length > 0 ? (
          <div className="space-y-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-neutral-900 border border-neutral-800 p-6 flex items-center gap-6"
              >
                <img
                  src={artist.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"}
                  alt={artist.name || "Artiste"}
                  className="w-16 h-16 object-cover bg-neutral-800"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-light">{artist.name || "Sans nom"}</h3>
                    <span className={`px-2 py-1 text-xs ${statusLabels[artist.status].color}`}>
                      {statusLabels[artist.status].label}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-sm">{artist.email}</p>
                  <p className="text-neutral-600 text-sm">
                    {artist.artistProfile?._count.artworks || 0} œuvres • 
                    Inscrit le {artist.createdAt.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-3">
                  {artist.status === "PENDING" && (
                    <>
                      <form action={`/api/admin/artists/${artist.id}/approve`} method="POST">
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-sm hover:bg-green-700 transition-colors"
                        >
                          Approuver
                        </button>
                      </form>
                      <form action={`/api/admin/artists/${artist.id}/reject`} method="POST">
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-red-600 text-sm hover:bg-red-700 transition-colors"
                        >
                          Refuser
                        </button>
                      </form>
                    </>
                  )}
                  {artist.status === "ACTIVE" && (
                    <button className="px-4 py-2 border border-neutral-700 text-sm hover:border-white transition-colors">
                      Voir profil
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-neutral-800">
            <p className="text-neutral-500">Aucun artiste pour le moment</p>
          </div>
        )}
      </div>
    </main>
  )
}
