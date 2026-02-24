"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Upload,
  Download,
  BarChart3,
} from "lucide-react"

interface VirtualExhibition {
  id: string
  slug: string
  title: string
  theme: string
  status: string
  views: number
  createdAt: string
  _count?: { artworks: number }
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-600 text-gray-200",
  PENDING: "bg-amber-600/30 text-amber-400 border border-amber-500/50",
  PUBLISHED: "bg-emerald-600/30 text-emerald-400 border border-emerald-500/50",
  ARCHIVED: "bg-red-600/30 text-red-400 border border-red-500/50",
}

export default function AdminVirtualExhibitionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [exhibitions, setExhibitions] = useState<VirtualExhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState("")

  const fetchExhibitions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ admin: "true", limit: "50" })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/virtual-exhibitions?${params}`)
      if (!res.ok) throw new Error("Erreur lors du chargement")
      const data = await res.json()
      setExhibitions(data.exhibitions || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
      setExhibitions([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
    fetchExhibitions()
  }, [session, status, router, fetchExhibitions])

  const handlePublish = async (id: string, action: "publish" | "unpublish") => {
    try {
      const res = await fetch(`/api/virtual-exhibitions/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "publish" ? "publish" : "unpublish",
        }),
      })
      if (!res.ok) throw new Error("Erreur")
      fetchExhibitions()
    } catch {
      setError("Erreur lors de la mise à jour")
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'exposition « ${title} » ?`)) return
    try {
      const res = await fetch(`/api/virtual-exhibitions/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erreur")
      fetchExhibitions()
    } catch {
      setError("Erreur lors de la suppression")
    }
  }

  const filtered = exhibitions.filter(
    (e) =>
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.theme.toLowerCase().includes(search.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">
            Expositions virtuelles
          </h1>
          <p className="text-neutral-500 mt-1">
            Gérez vos expositions virtuelles 3D
          </p>
        </div>
        <Link
          href="/admin/virtual-exhibitions/new"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-black px-6 py-3 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle exposition
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Rechercher par titre ou thème..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-neutral-700 text-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-neutral-700 text-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PENDING">En attente</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </div>

      <div className="border border-neutral-800 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-neutral-900">
            <tr>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Titre
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Thème
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Statut
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Œuvres
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Vues
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Créé le
              </th>
              <th className="text-right px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                  Aucune exposition
                </td>
              </tr>
            ) : (
              filtered.map((ex) => (
                <tr key={ex.id} className="hover:bg-neutral-900/50">
                  <td className="px-6 py-4 text-white font-medium">{ex.title}</td>
                  <td className="px-6 py-4 text-neutral-400">
                    {ex.theme === "white" ? "Galerie blanche" : "Galerie sombre"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        STATUS_COLORS[ex.status] ?? "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {ex.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {ex._count?.artworks ?? 0}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{ex.views}</td>
                  <td className="px-6 py-4 text-neutral-400">
                    {new Date(ex.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/expositions-virtuelles/${ex.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/virtual-exhibitions/${ex.id}/stats`}
                        className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded transition-colors"
                        title="Statistiques"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/virtual-exhibitions/${ex.id}/edit`}
                        className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {ex.status === "PUBLISHED" ? (
                        <button
                          onClick={() => handlePublish(ex.id, "unpublish")}
                          className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded transition-colors"
                          title="Dépublier"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublish(ex.id, "publish")}
                          className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded transition-colors"
                          title="Publier"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(ex.id, ex.title)}
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
