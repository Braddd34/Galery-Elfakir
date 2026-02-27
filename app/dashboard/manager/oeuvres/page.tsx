"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { getArtworkImageUrl } from "@/lib/image-utils"

interface Artist {
  id: string
  name: string
}

interface Artwork {
  id: string
  title: string
  artistName: string
  artistId: string
  category: string
  price: number
  status: string
  views: number
  images: string
  createdAt: string
  description: string
}

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "PENDING", label: "En attente" },
  { value: "SOLD", label: "Vendue" },
  { value: "DRAFT", label: "Brouillon" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Date (récent)" },
  { value: "oldest", label: "Date (ancien)" },
  { value: "price_desc", label: "Prix ↓" },
  { value: "price_asc", label: "Prix ↑" },
  { value: "views", label: "Vues" },
  { value: "title", label: "Titre" },
]

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  DRAFT: { label: "Brouillon", classes: "bg-neutral-600 text-neutral-200" },
  PENDING: { label: "En attente", classes: "bg-yellow-500/20 text-yellow-400" },
  AVAILABLE: { label: "Disponible", classes: "bg-green-500/20 text-green-400" },
  RESERVED: { label: "Réservé", classes: "bg-blue-500/20 text-blue-400" },
  SOLD: { label: "Vendue", classes: "bg-purple-500/20 text-purple-400" },
  ARCHIVED: { label: "Archivé", classes: "bg-neutral-700 text-neutral-400" },
}

const CATEGORY_LABELS: Record<string, string> = {
  PAINTING: "Peinture",
  SCULPTURE: "Sculpture",
  PHOTOGRAPHY: "Photographie",
  DRAWING: "Dessin",
  PRINT: "Estampe",
  DIGITAL: "Art numérique",
  MIXED_MEDIA: "Technique mixte",
  OTHER: "Autre",
}

const EDIT_STATUS_OPTIONS = ["DRAFT", "PENDING", "AVAILABLE", "ARCHIVED"]

export default function ManagerOeuvresPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [artistFilter, setArtistFilter] = useState("")
  const [sort, setSort] = useState("newest")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchArtworks = useCallback(async (searchTerm: string) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set("search", searchTerm)
      if (statusFilter) params.set("status", statusFilter)
      if (artistFilter) params.set("artistId", artistFilter)
      if (sort) params.set("sort", sort)

      const res = await fetch(`/api/manager/artworks?${params}`)
      if (!res.ok) throw new Error("Erreur serveur")
      const data = await res.json()
      setArtworks(data.artworks || [])
      setPage(1)
    } catch {
      setError("Impossible de charger les œuvres")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, artistFilter, sort])

  const fetchArtists = useCallback(async () => {
    try {
      const res = await fetch("/api/manager/artists")
      if (res.ok) {
        const data = await res.json()
        setArtists(data.artists || [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchArtworks(search)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchArtworks])

  const openEdit = (artwork: Artwork) => {
    if (editingId === artwork.id) {
      setEditingId(null)
      return
    }
    setEditingId(artwork.id)
    setEditPrice(String(artwork.price))
    setEditDescription(artwork.description || "")
    setEditStatus(artwork.status)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setToast(null)
    try {
      const res = await fetch(`/api/manager/artworks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: parseFloat(editPrice),
          description: editDescription,
          status: editStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur")

      setArtworks(prev =>
        prev.map(a =>
          a.id === editingId
            ? { ...a, price: parseFloat(editPrice), description: editDescription, status: editStatus }
            : a
        )
      )
      setEditingId(null)
      setToast({ type: "success", message: "Œuvre mise à jour avec succès" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      setToast({ type: "error", message })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const paginatedArtworks = artworks.slice(0, page * PER_PAGE)
  const hasMore = paginatedArtworks.length < artworks.length

  return (
    <main className="min-h-screen bg-black text-white">
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Gestion des œuvres</h1>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-sm shadow-lg transition-all ${
              toast.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Barre de filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={artistFilter}
            onChange={e => setArtistFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="">Tous les artistes</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg animate-pulse flex gap-4 items-center">
                <div className="w-[50px] h-[50px] bg-neutral-800 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-48" />
                  <div className="h-3 bg-neutral-800 rounded w-32" />
                </div>
                <div className="h-6 bg-neutral-800 rounded w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="text-center py-16 border border-neutral-800 rounded-lg">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchArtworks(search)}
              className="px-6 py-2 border border-neutral-700 text-sm hover:border-white transition-colors rounded"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Liste vide */}
        {!loading && !error && artworks.length === 0 && (
          <div className="text-center py-16 border border-neutral-800 rounded-lg">
            <p className="text-neutral-500">Aucune œuvre trouvée</p>
          </div>
        )}

        {/* Tableau des œuvres */}
        {!loading && !error && artworks.length > 0 && (
          <>
            <div className="hidden lg:grid grid-cols-[50px_2fr_1fr_1fr_1fr_1fr_80px_100px_40px] gap-4 px-6 py-3 text-xs text-neutral-500 uppercase tracking-wider border-b border-neutral-800 mb-2">
              <span />
              <span>Titre</span>
              <span>Artiste</span>
              <span>Catégorie</span>
              <span>Prix</span>
              <span>Statut</span>
              <span>Vues</span>
              <span>Date</span>
              <span />
            </div>

            <div className="space-y-2">
              {paginatedArtworks.map(artwork => {
                const badge = STATUS_BADGES[artwork.status] || STATUS_BADGES.DRAFT
                const isEditing = editingId === artwork.id
                return (
                  <div key={artwork.id}>
                    {/* Ligne principale */}
                    <div
                      className={`bg-neutral-900 border rounded-lg px-6 py-4 cursor-pointer transition-colors hover:bg-neutral-800/50 ${
                        isEditing ? "border-neutral-600" : "border-neutral-800"
                      }`}
                      onClick={() => openEdit(artwork)}
                    >
                      {/* Desktop */}
                      <div className="hidden lg:grid grid-cols-[50px_2fr_1fr_1fr_1fr_1fr_80px_100px_40px] gap-4 items-center">
                        <img
                          src={getArtworkImageUrl(artwork.images)}
                          alt={artwork.title}
                          className="w-[50px] h-[50px] object-cover rounded bg-neutral-800"
                        />
                        <span className="truncate font-light">{artwork.title}</span>
                        <span className="text-neutral-400 text-sm truncate">{artwork.artistName}</span>
                        <span className="text-neutral-400 text-sm">{CATEGORY_LABELS[artwork.category] || artwork.category}</span>
                        <span className="text-sm">{Number(artwork.price).toLocaleString()} €</span>
                        <span className={`inline-block px-2 py-1 text-xs rounded w-fit ${badge.classes}`}>
                          {badge.label}
                        </span>
                        <span className="text-neutral-400 text-sm">{artwork.views}</span>
                        <span className="text-neutral-500 text-xs">
                          {new Date(artwork.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isEditing ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Mobile */}
                      <div className="lg:hidden flex gap-4 items-center">
                        <img
                          src={getArtworkImageUrl(artwork.images)}
                          alt={artwork.title}
                          className="w-[50px] h-[50px] object-cover rounded bg-neutral-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-light truncate">{artwork.title}</span>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-neutral-400 text-sm">{artwork.artistName} · {Number(artwork.price).toLocaleString()} €</p>
                        </div>
                        <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isEditing ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Panneau d'édition inline */}
                    {isEditing && (
                      <div
                        className="bg-neutral-900/80 border border-neutral-700 border-t-0 rounded-b-lg px-6 py-6"
                        onClick={e => e.stopPropagation()}
                      >
                        {artwork.status === "SOLD" ? (
                          <p className="text-neutral-500 text-sm">Cette œuvre a été vendue et ne peut plus être modifiée.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Prix (€)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Statut</label>
                              <select
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-500"
                              >
                                {EDIT_STATUS_OPTIONS.map(s => (
                                  <option key={s} value={s}>
                                    {STATUS_BADGES[s]?.label || s}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="w-full bg-white text-black px-4 py-2 text-sm rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
                              >
                                {saving ? "Enregistrement..." : "Enregistrer"}
                              </button>
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-xs text-neutral-400 mb-1">Description</label>
                              <textarea
                                rows={3}
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-500 resize-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 border border-neutral-700 text-sm hover:border-white transition-colors rounded"
                >
                  Charger plus ({artworks.length - paginatedArtworks.length} restantes)
                </button>
              </div>
            )}

            <p className="text-neutral-600 text-xs mt-4 text-center">
              {artworks.length} œuvre{artworks.length > 1 ? "s" : ""} au total
            </p>
          </>
        )}
      </div>
    </main>
  )
}
