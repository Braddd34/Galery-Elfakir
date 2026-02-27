"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { getArtworkImageUrl } from "@/lib/image-utils"
import {
  LAYOUT_META,
  LAYOUT_IDS,
  THEME_META,
  THEME_IDS,
} from "@/lib/virtual-exhibition/types"
import type { LayoutId, ThemeId } from "@/lib/virtual-exhibition/types"
import { generateLayout, suggestLayout } from "@/lib/virtual-exhibition/layouts"
import { autoPlaceArtworks } from "@/lib/virtual-exhibition/auto-placement"

interface Artwork {
  id: string
  title: string
  images: unknown
  width: number | string
  height: number | string
  artist?: { user?: { name?: string } }
}

interface PlacedArtwork {
  artworkId: string
  artwork: Artwork
  wall: string
  positionX: number
  positionY: number
  scale: number
}

function getImageUrl(images: unknown): string {
  return getArtworkImageUrl(images)
}

export default function NewVirtualExhibitionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedLayout, setSelectedLayout] = useState<LayoutId>("intime")
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("white")
  const [coverImage, setCoverImage] = useState("")

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artworkSearch, setArtworkSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [placedArtworks, setPlacedArtworks] = useState<PlacedArtwork[]>([])

  const selectedArtworks = artworks.filter((a) => selectedIds.has(a.id))

  const layout = useMemo(
    () => generateLayout(selectedLayout, selectedIds.size),
    [selectedLayout, selectedIds.size]
  )

  const fetchArtworks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "200", page: "1" })
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
  }, [session, status, router])

  useEffect(() => {
    if (step === 2) fetchArtworks()
  }, [step, fetchArtworks])

  const toggleArtwork = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 100) next.add(id)
      return next
    })
  }

  const runAutoPlacement = useCallback(() => {
    const selected = artworks.filter((a) => selectedIds.has(a.id))
    if (selected.length === 0) return

    const suggested = suggestLayout(selected.length)
    const layoutForPlace = generateLayout(selectedLayout || suggested, selected.length)
    const placements = autoPlaceArtworks(
      selected.map((a) => ({
        width: Number(a.width) || 50,
        height: Number(a.height) || 50,
      })),
      layoutForPlace.allSegments
    )

    const placed: PlacedArtwork[] = placements.map((p) => ({
      artworkId: selected[p.artworkIndex].id,
      artwork: selected[p.artworkIndex],
      wall: p.segmentId,
      positionX: p.positionX,
      positionY: p.positionY,
      scale: p.scale,
    }))

    setPlacedArtworks(placed)
  }, [artworks, selectedIds, selectedLayout])

  const handleSubmit = async (asDraft: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/virtual-exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          theme: selectedTheme,
          coverImage: coverImage || null,
          status: asDraft ? "DRAFT" : "PENDING",
          roomConfig: {
            layout: selectedLayout,
            width: layout.room.width,
            length: layout.room.length,
            height: layout.room.height,
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur création")
      }
      const exhibition = await res.json()

      const batchRes = await fetch(
        `/api/virtual-exhibitions/${exhibition.id}/artworks`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placements: placedArtworks.map((p, i) => ({
              artworkId: p.artworkId,
              wall: p.wall,
              positionX: p.positionX,
              positionY: p.positionY,
              scale: p.scale,
              displayOrder: i,
            })),
          }),
        }
      )
      if (!batchRes.ok) {
        const data = await batchRes.json().catch(() => ({}))
        throw new Error(data.error || "Erreur ajout des œuvres")
      }

      router.push("/admin/virtual-exhibitions")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  const canProceedStep1 = title.trim().length > 0 && description.trim().length > 0
  const canProceedStep2 = selectedIds.size > 0
  const canProceedStep3 = placedArtworks.length > 0

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/virtual-exhibitions" className="text-neutral-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-light text-white">Nouvelle exposition virtuelle</h1>
          <p className="text-neutral-500 mt-1">Étape {step} sur 4</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3">{error}</div>
      )}

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded ${s <= step ? "bg-amber-500" : "bg-neutral-800"}`}
          />
        ))}
      </div>

      {/* ================================================================ */}
      {/* STEP 1 : Informations + Layout + Thème                          */}
      {/* ================================================================ */}
      {step === 1 && (
        <div className="space-y-8 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900 border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Ex: Printemps 2025"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">URL image de couverture</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-gray-900 border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-900 border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              placeholder="Décrivez votre exposition..."
            />
          </div>

          {/* Layout selector */}
          <div>
            <label className="block text-sm text-neutral-400 mb-3">Disposition de la salle</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {LAYOUT_IDS.map((lid) => {
                const meta = LAYOUT_META[lid]
                const active = selectedLayout === lid
                return (
                  <button
                    key={lid}
                    type="button"
                    onClick={() => setSelectedLayout(lid)}
                    className={`text-left p-4 border-2 transition-all ${
                      active
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-neutral-700 hover:border-neutral-500 bg-neutral-900"
                    }`}
                  >
                    <p className="text-white font-medium text-sm">{meta.name}</p>
                    <p className="text-neutral-500 text-xs mt-1 leading-relaxed">{meta.description}</p>
                    <p className="text-amber-500/70 text-[11px] mt-2 font-mono">{meta.range}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Theme selector */}
          <div>
            <label className="block text-sm text-neutral-400 mb-3">Ambiance visuelle</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {THEME_IDS.map((tid) => {
                const meta = THEME_META[tid]
                const active = selectedTheme === tid
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => setSelectedTheme(tid)}
                    className={`text-left p-4 border-2 transition-all ${
                      active
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-neutral-700 hover:border-neutral-500 bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-5 h-5 rounded-full border border-neutral-600"
                        style={{ backgroundColor: meta.accent }}
                      />
                      <p className="text-white font-medium text-sm">{meta.name}</p>
                    </div>
                    <p className="text-neutral-500 text-xs leading-relaxed">{meta.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 2 : Sélection des œuvres                                   */}
      {/* ================================================================ */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Rechercher des œuvres..."
              value={artworkSearch}
              onChange={(e) => setArtworkSearch(e.target.value)}
              className="w-full max-w-md bg-gray-900 border border-neutral-700 text-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <p className="text-neutral-400 text-sm">
              {selectedIds.size} / 100 œuvre(s) sélectionnée(s)
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {artworks.map((a) => (
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
          {artworks.length === 0 && (
            <p className="text-neutral-500">Aucune œuvre trouvée</p>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 3 : Placement automatique + aperçu plan 2D                 */}
      {/* ================================================================ */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={runAutoPlacement}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium transition-colors"
            >
              Redistribuer automatiquement
            </button>
            <span className="text-neutral-400 text-sm">
              {placedArtworks.length} œuvre(s) placée(s) — Layout : {LAYOUT_META[selectedLayout].name}
            </span>
          </div>

          {/* Plan 2D vue du dessus */}
          <div className="max-w-2xl mx-auto">
            <FloorPlan
              layout={layout}
              placedArtworks={placedArtworks}
              getImageUrl={getImageUrl}
            />
          </div>

          {/* List of placed artworks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
            {placedArtworks.map((p) => (
              <div key={p.artworkId} className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800">
                <div className="w-8 h-8 bg-neutral-800 flex-shrink-0 overflow-hidden">
                  <img src={getImageUrl(p.artwork.images) || ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white truncate">{p.artwork.title}</p>
                  <p className="text-[10px] text-amber-500/70 font-mono">{p.wall}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 4 : Récapitulatif                                          */}
      {/* ================================================================ */}
      {step === 4 && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h2 className="text-xl font-light text-white">{title}</h2>
            <p className="text-neutral-400 text-sm">{description}</p>
            <div className="flex gap-4 text-sm text-neutral-500">
              <span>Layout : {LAYOUT_META[selectedLayout].name}</span>
              <span>Thème : {THEME_META[selectedTheme].name}</span>
            </div>
            <div className="flex gap-4 text-sm text-neutral-500">
              <span>Salle : {layout.room.width.toFixed(0)}m × {layout.room.length.toFixed(0)}m</span>
              <span>{layout.partitions.length} cloison(s)</span>
            </div>
            <div className="border-t border-neutral-800 pt-4 mt-4">
              <p className="text-white text-sm font-medium mb-3">
                {placedArtworks.length} œuvre(s) placée(s)
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-6 py-3 border border-neutral-600 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Enregistrer en brouillon"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Soumettre pour publication"}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Navigation                                                       */}
      {/* ================================================================ */}
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
            onClick={() => {
              if (step === 2) runAutoPlacement()
              setStep((s) => s + 1)
            }}
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

/* ====================================================================== */
/* Floor Plan 2D Component                                                */
/* ====================================================================== */

function FloorPlan({
  layout,
  placedArtworks,
  getImageUrl,
}: {
  layout: ReturnType<typeof generateLayout>
  placedArtworks: PlacedArtwork[]
  getImageUrl: (images: unknown) => string
}) {
  const { room, partitions } = layout
  const padding = 20
  const maxW = 560
  const scale = Math.min((maxW - padding * 2) / room.width, 300 / room.length)
  const w = room.width * scale + padding * 2
  const h = room.length * scale + padding * 2

  function toSvg(worldX: number, worldZ: number) {
    return {
      x: padding + (room.width / 2 + worldX) * scale,
      y: padding + (room.length / 2 - worldZ) * scale,
    }
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full border border-neutral-700 bg-neutral-950 rounded">
      {/* Room outline */}
      <rect
        x={padding}
        y={padding}
        width={room.width * scale}
        height={room.length * scale}
        fill="none"
        stroke="#555"
        strokeWidth={2}
      />

      {/* Doorway (gap in south wall) */}
      {(() => {
        const doorW = 2 * scale
        const cx = padding + (room.width * scale) / 2
        const y = padding + room.length * scale
        return (
          <line x1={cx - doorW / 2} y1={y} x2={cx + doorW / 2} y2={y} stroke="#111" strokeWidth={3} />
        )
      })()}

      {/* Partitions */}
      {partitions.map((part) => {
        const cx = part.position[0]
        const cz = part.position[2]
        const hw = part.width / 2
        const isHoriz = Math.abs(part.rotationY) < 0.01
        const x1 = isHoriz ? cx - hw : cx
        const z1 = isHoriz ? cz : cz - hw
        const x2 = isHoriz ? cx + hw : cx
        const z2 = isHoriz ? cz : cz + hw
        const p1 = toSvg(x1, z1)
        const p2 = toSvg(x2, z2)
        return (
          <line
            key={part.id}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            stroke="#666"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )
      })}

      {/* Artwork dots */}
      {placedArtworks.map((p) => {
        const seg = layout.allSegments.find((s) => s.id === p.wall)
        if (!seg) return null
        const localX = (p.positionX - 0.5) * seg.width
        const cosR = Math.cos(seg.rotation[1])
        const sinR = Math.sin(seg.rotation[1])
        const wx = seg.position[0] + localX * cosR
        const wz = seg.position[2] - localX * sinR
        const pt = toSvg(wx, wz)
        return (
          <circle
            key={p.artworkId}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#d4af37"
            stroke="#000"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Labels */}
      <text x={w / 2} y={padding - 5} textAnchor="middle" fill="#888" fontSize={10}>Nord</text>
      <text x={w / 2} y={h - padding + 14} textAnchor="middle" fill="#888" fontSize={10}>Sud</text>
      <text x={padding - 5} y={h / 2} textAnchor="end" fill="#888" fontSize={10} dominantBaseline="middle">O</text>
      <text x={w - padding + 5} y={h / 2} textAnchor="start" fill="#888" fontSize={10} dominantBaseline="middle">E</text>
    </svg>
  )
}
