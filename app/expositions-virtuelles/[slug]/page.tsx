"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useCart } from "@/lib/cart-context"
import type { ExhibitionArtwork } from "@/components/virtual-exhibition/Gallery3D"

const Gallery3D = dynamic(
  () => import("@/components/virtual-exhibition/Gallery3D"),
  { ssr: false }
)

function getDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop"
  const w = window.innerWidth
  if (w < 768) return "mobile"
  if (w < 1024) return "tablet"
  return "desktop"
}

export default function ExpositionVirtuelleViewerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { addItem } = useCart()

  const [exhibition, setExhibition] = useState<{
    id: string
    title: string
    theme: string
    roomConfig?: { width?: number; length?: number; height?: number }
    artworks: Array<{
      wall: string
      positionX: number
      positionY: number
      scale: number
      artwork: {
        id: string
        title: string
        images: unknown
        price: number | string
        slug: string
        width: number | string
        height: number | string
        artist?: { name?: string }
      }
    }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const analyticsIdRef = useRef<string | null>(null)
  const enteredAtRef = useRef<Date | null>(null)

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = exhibition
        ? `${exhibition.title} | Expositions Virtuelles — ELFAKIR`
        : "Exposition Virtuelle — ELFAKIR"
    }
  }, [exhibition?.title])

  useEffect(() => {
    let cancelled = false

    async function fetchExhibition() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/virtual-exhibitions/slug/${slug}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError("Exposition non trouvée")
          } else {
            setError("Une erreur est survenue")
          }
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setExhibition(data)
        }
      } catch {
        if (!cancelled) setError("Une erreur est survenue")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchExhibition()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!exhibition?.id || loading) return

    const sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const device = getDevice()

    fetch(`/api/virtual-exhibitions/${exhibition.id}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, device, source: "public" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          analyticsIdRef.current = data.id
          enteredAtRef.current = data.enteredAt ? new Date(data.enteredAt) : new Date()
        }
      })
      .catch(() => {})
  }, [exhibition?.id, loading])

  const handleExit = useCallback(() => {
    if (analyticsIdRef.current && exhibition?.id && enteredAtRef.current) {
      const duration = Math.floor(
        (Date.now() - enteredAtRef.current.getTime()) / 1000
      )
      fetch(
        `/api/virtual-exhibitions/${exhibition.id}/analytics/${analyticsIdRef.current}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration, exitedAt: new Date().toISOString() }),
        }
      ).catch(() => {})
    }
    router.push("/expositions-virtuelles")
  }, [exhibition?.id, router])

  const handleAddToCart = useCallback(
    (artwork: ExhibitionArtwork) => {
      addItem({
        id: artwork.id,
        slug: artwork.slug,
        title: artwork.title,
        price: artwork.price,
        image: artwork.imageUrl,
        artistName: artwork.artistName,
      })
    },
    [addItem]
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="animate-pulse text-amber-500/80 text-xl font-light mb-6">
          {slug ? "Chargement de l'exposition..." : ""}
        </div>
        <div className="w-12 h-12 border-2 border-amber-500/50 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-6">
        <h1 className="text-xl font-medium text-white mb-2">
          {error || "Exposition non trouvée"}
        </h1>
        <p className="text-neutral-500 mb-8">
          Cette exposition n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <button
          type="button"
          onClick={() => router.push("/expositions-virtuelles")}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-medium rounded transition-colors"
        >
          Retour aux expositions
        </button>
      </div>
    )
  }

  const mappedArtworks: ExhibitionArtwork[] = exhibition.artworks.map(
    (ea: (typeof exhibition.artworks)[0]) => {
      const imgs =
        typeof ea.artwork.images === "string"
          ? JSON.parse(ea.artwork.images)
          : (ea.artwork.images as { url?: string }[] | null)
      const imageUrl = imgs?.[0]?.url || ""

      return {
        id: ea.artwork.id,
        title: ea.artwork.title,
        artistName: ea.artwork.artist?.name || "Artiste",
        price: Number(ea.artwork.price),
        slug: ea.artwork.slug,
        imageUrl,
        width: Number(ea.artwork.width),
        height: Number(ea.artwork.height),
        wall: ea.wall as "north" | "south" | "east" | "west",
        positionX: ea.positionX,
        positionY: ea.positionY,
        scale: ea.scale,
      }
    }
  )

  const theme =
    exhibition.theme === "dark" ? "dark" : "white"

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <Gallery3D
        exhibitionId={exhibition.id}
        title={exhibition.title}
        theme={theme}
        artworks={mappedArtworks}
        roomConfig={exhibition.roomConfig ?? undefined}
        onExit={handleExit}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
