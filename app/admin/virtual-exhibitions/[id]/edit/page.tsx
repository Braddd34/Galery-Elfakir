"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface Artwork {
  id: string
  title: string
  images: unknown
  artist?: { user?: { name?: string } }
}

interface PlacedArtwork {
  id?: string
  artworkId: string
  artwork: Artwork
  wall: string
  positionX: number
  positionY: number
}

function getImageUrl(images: unknown): string {
  if (!images) return ""
  try {
    const parsed =
      typeof images === "string" ? JSON.parse(images) : (images as { url?: string }[])
    return Array.isArray(parsed) ? parsed[0]?.url || "" : ""
  } catch {
    return ""
  }
}

const WALLS = ["north", "south", "east", "west"] as const

export default function EditVirtualExhibitionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [theme, setTheme] = useState<"white" | "dark">("white")
  const [coverImage, setCoverImage] = useState("")

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artworkSearch, setArtworkSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [placedArtworks, setPlacedArtworks] = useState<PlacedArtwork[]>([])
  const [selectedForPlacement, setSelectedForPlacement] = useState<string | null>(null)
  const [existingArtworkIds, setExistingArtworkIds] = useState<Set<string>>(new Set())

  const fetchExhibition = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/virtual-exhibitions/${id}`)
      if (!res.ok) throw new Error("Exposition non trouvée")
      const data = await res.json()
      setTitle(data.title || "")
      setDescription(data.description || "")
      setTheme(data.theme === "dark" ? "dark" : "white")
      setCoverImage(data.coverImage || "")
      const arts = (data.artworks || []).map((a: { artwork: Artwork & { id: string }; wall: string; positionX: number; positionY: number }) => ({
        artworkId: a.artwork.id,
        artwork: a.artwork,
        wall: a.wall,
        positionX: a.positionX,
        positionY: a.positionY,
      }))
      setPlacedArtworks(arts)
      setSelectedIds(new Set(arts.map((a: PlacedArtwork) => a.artworkId)))
      setExistingArtworkIds(new Set(arts.map((a: PlacedArtwork) => a.artworkId)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchArtworks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100", page: "1" })
      if (artworkSearch) params.set("search", artworkSearch)
      const res = await fetch(`/api/catalogue?${params}`)
      if (!res.ok) throw new Error("Erreur chargement")
      const data = await res.json()
      setArtworks(data.artworks || [])
    } catch {
      setArtworks([])
    }
  }, [artworkSearch])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
    fetchExhibition()
  }, [session, status, router, fetchExhibition])

  useEffect(() => {
    if (step === 2) fetchArtworks()
  }, [step, fetchArtworks])

  const toggleArtwork = (artworkId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(artworkId)) {
        next.delete(artworkId)
        setPlacedArtworks((p) => p.filter((x) => x.artworkId !== artworkId))
      } else {
        next.add(artworkId)
      }
      return next
    })
  }

  const handleWallClick = (wall: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedForPlacement) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const positionX = Math.max(0, Math.min(1, (wall === "north" || wall === "south" ? x : y)))
    const positionY = 0.5
    const artwork = artworks.find((a) => a.id === selectedForPlacement) || placedArtworks.find((p) => p.artworkId === selectedForPlacement)?.artwork
    if (!artwork) return
    setPlacedArtworks((prev) => {
      const filtered = prev.filter((p) => p.artworkId !== selectedForPlacement)
      return [
        ...filtered,
        { artworkId: selectedForPlacement, artwork, wall, positionX, positionY },
      ]
    })
    setSelectedForPlacement(null)
  }

  const removePlaced = (artworkId: string) => {
    setPlacedArtworks((prev) => prev.filter((p) => p.artworkId !== artworkId))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(artworkId)
      return next
    })
  }

  const canProceedStep1 = title.trim().length > 0 && description.trim().length > 0
  const canProceedStep2 = selectedIds.size > 0
  const canProceedStep3 = placedArtworks.length > 0

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/virtual-exhibitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          theme: theme === "white" ? "white" : "dark",
          coverImage: coverImage || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur mise à jour")
      }

      const toAdd = placedArtworks.filter((p) => !existingArtworkIds.has(p.artworkId))
      const toRemove = [...existingArtworkIds].filter((aid) => !placedArtworks.some((p) => p.artworkId === aid))

      for (const aid of toRemove) {
        await fetch(`/api/virtual-exhibitions/${id}/artworks`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artworkId: aid }),
        })
      }

      for (const p of toAdd) {
        const artRes = await fetch(`/api/virtual-exhibitions/${id}/artworks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artworkId: p.artworkId,
            wall: p.wall,
            positionX: p.positionX,
            positionY: p.positionY,
          }),
        })
        if (!artRes.ok) throw new Error("Erreur ajout œuvre")
      }

      router.push("/admin/virtual-exhibitions")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="space-y-4">
        <Link href="/admin/virtual-exhibitions" className="text-amber-500 hover:underline">
          ← Retour
        </Link>
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/virtual-exhibitions"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-light text-white">
            Modifier l'exposition
          </h1>
          <p className="text-neutral-500 mt-1">Étape {step} sur 4</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded ${
              s <= step ? "bg-amber-500" : "bg-neutral-800"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Thème</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "white"}
                  onChange={() => setTheme("white")}
                  className="accent-amber-500"
                />
                <span className="text-white">Galerie blanche</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="accent-amber-500"
                />
                <span className="text-white">Galerie sombre</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">URL image de couverture</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-gray-900 border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Rechercher des œuvres..."
            value={artworkSearch}
            onChange={(e) => setArtworkSearch(e.target.value)}
            className="w-full max-w-md bg-gray-900 border border-neutral-700 text-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <p className="text-neutral-400 text-sm">
            {selectedIds.size} œuvre(s) sélectionnée(s)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {[
              ...artworks,
              ...placedArtworks
                .filter((p) => !artworks.some((a) => a.id === p.artworkId))
                .map((p) => p.artwork),
            ].map((a) => (
              <label
                key={a.id}
                className={`relative block cursor-pointer border-2 transition-colors ${
                  selectedIds.has(a.id)
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(a.id)}
                  onChange={() => toggleArtwork(a.id)}
                  className="sr-only"
                />
                <div className="aspect-square bg-neutral-900 relative overflow-hidden">
                  <img
                    src={getImageUrl(a.images) || "/placeholder.png"}
                    alt={a.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="p-2 text-xs text-white truncate">{a.title}</p>
              </label>
            ))}
          </div>
          {artworks.length === 0 && <p className="text-neutral-500">Aucune œuvre trouvée</p>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto border-2 border-amber-500/50 bg-neutral-900">
                <div className="absolute top-0 left-0 right-0 h-14 border-b border-neutral-700 flex flex-col items-center justify-center gap-1 text-xs text-neutral-400 bg-neutral-800/80 cursor-pointer hover:bg-neutral-700/80 transition-colors" onClick={(e) => handleWallClick("north", e)}>
                  <span>Nord</span>
                  <div className="flex gap-1 overflow-x-auto max-w-full">
                    {placedArtworks.filter((p) => p.wall === "north").sort((a, b) => a.positionX - b.positionX).map((p) => (
                      <div key={p.artworkId} className="relative group flex-shrink-0" onClick={(ev) => ev.stopPropagation()}>
                        <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 overflow-hidden">
                          <img src={getImageUrl(p.artwork.images) || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => removePlaced(p.artworkId)} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-14 border-t border-neutral-700 flex flex-col items-center justify-center gap-1 text-xs text-neutral-400 bg-neutral-800/80 cursor-pointer hover:bg-neutral-700/80 transition-colors" onClick={(e) => handleWallClick("south", e)}>
                  <span>Sud</span>
                  <div className="flex gap-1 overflow-x-auto max-w-full">
                    {placedArtworks.filter((p) => p.wall === "south").sort((a, b) => a.positionX - b.positionX).map((p) => (
                      <div key={p.artworkId} className="relative group flex-shrink-0" onClick={(ev) => ev.stopPropagation()}>
                        <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 overflow-hidden">
                          <img src={getImageUrl(p.artwork.images) || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => removePlaced(p.artworkId)} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-14 bottom-14 left-0 w-14 border-r border-neutral-700 flex flex-col items-center justify-center gap-1 text-xs text-neutral-400 bg-neutral-800/80 cursor-pointer hover:bg-neutral-700/80 transition-colors" onClick={(e) => handleWallClick("west", e)}>
                  <span>Ouest</span>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-20">
                    {placedArtworks.filter((p) => p.wall === "west").sort((a, b) => a.positionX - b.positionX).map((p) => (
                      <div key={p.artworkId} className="relative group flex-shrink-0" onClick={(ev) => ev.stopPropagation()}>
                        <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 overflow-hidden">
                          <img src={getImageUrl(p.artwork.images) || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => removePlaced(p.artworkId)} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-14 bottom-14 right-0 w-14 border-l border-neutral-700 flex flex-col items-center justify-center gap-1 text-xs text-neutral-400 bg-neutral-800/80 cursor-pointer hover:bg-neutral-700/80 transition-colors" onClick={(e) => handleWallClick("east", e)}>
                  <span>Est</span>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-20">
                    {placedArtworks.filter((p) => p.wall === "east").sort((a, b) => a.positionX - b.positionX).map((p) => (
                      <div key={p.artworkId} className="relative group flex-shrink-0" onClick={(ev) => ev.stopPropagation()}>
                        <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 overflow-hidden">
                          <img src={getImageUrl(p.artwork.images) || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => removePlaced(p.artworkId)} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-neutral-500 text-sm mt-2">
                Cliquez sur une œuvre à droite puis sur un mur pour la placer
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-2">Œuvres sélectionnées</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {placedArtworks.map((p) => (
                  <button
                    key={p.artworkId}
                    type="button"
                    onClick={() => setSelectedForPlacement(selectedForPlacement === p.artworkId ? null : p.artworkId)}
                    className={`w-full flex items-center gap-3 p-2 border text-left transition-colors ${
                      selectedForPlacement === p.artworkId ? "border-amber-500 bg-amber-500/20" : "border-neutral-700 hover:border-neutral-600"
                    }`}
                  >
                    <div className="w-10 h-10 bg-neutral-800 flex-shrink-0 overflow-hidden">
                      <img src={getImageUrl(p.artwork.images) || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-white truncate flex-1">{p.artwork.title}</span>
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h2 className="text-xl font-light text-white">{title}</h2>
            <p className="text-neutral-400 text-sm">{description}</p>
            <p className="text-neutral-500 text-sm">
              Thème : {theme === "white" ? "Galerie blanche" : "Galerie sombre"}
            </p>
            <p className="text-neutral-500 text-sm">{placedArtworks.length} œuvre(s) placée(s)</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      )}

      <div className="flex justify-between pt-8 border-t border-neutral-800">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canProceedStep2) ||
              (step === 3 && !canProceedStep3)
            }
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-black px-6 py-2 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
