"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import GalleryRoom from "./GalleryRoom"
import ArtworkFrame from "./ArtworkFrame"
import PlayerController from "./PlayerController"
import GalleryLighting from "./GalleryLighting"
import MobileControls from "./MobileControls"
import Minimap from "./Minimap"
import Link from "next/link"

export interface ExhibitionArtwork {
  id: string
  title: string
  artistName: string
  price: number
  slug: string
  imageUrl: string
  width: number
  height: number
  wall: "north" | "south" | "east" | "west"
  positionX: number
  positionY: number
  scale: number
}

export interface Gallery3DProps {
  exhibitionId: string
  title: string
  theme: "white" | "dark"
  artworks: ExhibitionArtwork[]
  roomConfig?: { width?: number; length?: number; height?: number }
  onArtworkClick?: (artwork: ExhibitionArtwork) => void
  onExit?: () => void
  onAddToCart?: (artwork: ExhibitionArtwork) => void
  onAnalyticsEvent?: (event: { type: string; data?: unknown }) => void
}

export default function Gallery3D({
  exhibitionId,
  title,
  theme,
  artworks,
  roomConfig,
  onArtworkClick,
  onExit,
  onAddToCart,
  onAnalyticsEvent,
}: Gallery3DProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<ExhibitionArtwork | null>(null)
  const [highlightedArtworkId, setHighlightedArtworkId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 })
  const [playerRot, setPlayerRot] = useState(0)

  const width = roomConfig?.width ?? 8
  const length = roomConfig?.length ?? 10
  const height = roomConfig?.height ?? 3.5

  useEffect(() => {
    const checkMobile = () => {
      const mq = window.matchMedia("(max-width: 768px)")
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      setIsMobile(mq.matches || mobileUA)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    onAnalyticsEvent?.({ type: "enter", data: { exhibitionId } })
  }, [exhibitionId, onAnalyticsEvent])

  const handleArtworkClick = useCallback(
    (artwork: ExhibitionArtwork) => {
      setSelectedArtwork(artwork)
      onArtworkClick?.(artwork)
      onAnalyticsEvent?.({ type: "artwork_click", data: { artworkId: artwork.id } })
    },
    [onArtworkClick, onAnalyticsEvent]
  )

  const handleArtworkHover = useCallback(
    (artworkId: string | null) => {
      setHighlightedArtworkId(artworkId)
      if (artworkId) {
        onAnalyticsEvent?.({ type: "artwork_hover", data: { artworkId } })
      }
    },
    [onAnalyticsEvent]
  )

  const handleLockChange = useCallback((locked: boolean) => {
    setIsLocked(locked)
  }, [])

  return (
    <div ref={canvasContainerRef} style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Suspense
        fallback={
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "system-ui, sans-serif",
              fontSize: "1.125rem",
            }}
          >
            Chargement de l&apos;exposition...
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ fov: 60, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          style={{ width: "100vw", height: "100vh", display: "block" }}
        >
          <GalleryLighting theme={theme} roomHeight={height} roomWidth={width} roomLength={length} />
          <GalleryRoom theme={theme} roomConfig={roomConfig} />
          {artworks.map((artwork) => (
            <ArtworkFrame
              key={artwork.id}
              artwork={artwork}
              wall={artwork.wall}
              positionX={artwork.positionX}
              positionY={artwork.positionY}
              scale={artwork.scale}
              roomWidth={width}
              roomLength={length}
              roomHeight={height}
              isHighlighted={highlightedArtworkId === artwork.id}
              onClick={() => handleArtworkClick(artwork)}
              onPointerOver={() => handleArtworkHover(artwork.id)}
              onPointerOut={() => handleArtworkHover(null)}
            />
          ))}
          <PlayerController
            roomWidth={width}
            roomLength={length}
            roomHeight={height}
            onLockChange={handleLockChange}
          />
        </Canvas>
      </Suspense>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <h1 className="text-white text-lg font-semibold truncate flex-1 mr-4">{title}</h1>
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
        >
          Quitter
        </button>
      </div>

      {selectedArtwork && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "min(400px, 100%)",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 200,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedArtwork(null)}
            className="self-end text-white hover:text-gray-300 text-2xl leading-none mb-4"
            aria-label="Fermer"
          >
            ×
          </button>
          <div className="flex-1 flex flex-col gap-4">
            <img
              src={selectedArtwork.imageUrl}
              alt={selectedArtwork.title}
              className="w-full aspect-auto object-contain rounded"
            />
            <h2 className="text-white text-xl font-semibold">{selectedArtwork.title}</h2>
            <p className="text-gray-300">{selectedArtwork.artistName}</p>
            <p className="text-white font-medium">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(selectedArtwork.price)}
            </p>
            <Link
              href={`/oeuvre/${selectedArtwork.slug}`}
              className="inline-block px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors text-center"
            >
              Voir l&apos;oeuvre
            </Link>
            <button
              type="button"
              onClick={() => onAddToCart?.(selectedArtwork)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      )}

      {!isLocked && !selectedArtwork && (
        <div
          onClick={() => {
            const canvas = canvasContainerRef.current?.querySelector("canvas")
            if (canvas) {
              try { canvas.requestPointerLock() } catch { /* fallback mode */ }
              canvas.click()
            }
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            pointerEvents: "auto",
            textAlign: "center",
            padding: "2rem",
            cursor: "pointer",
          }}
        >
          <p style={{ color: "white", fontSize: "1.8rem", marginBottom: "1.5rem", fontWeight: 300 }}>
            Cliquez pour entrer dans l&apos;exposition
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "0.5rem 1.5rem",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.85rem",
            textAlign: "left",
          }}>
            <span style={{ color: "#d4a853" }}>WASD</span><span>Se déplacer</span>
            <span style={{ color: "#d4a853" }}>Flèches ← →</span><span>Tourner la tête</span>
            <span style={{ color: "#d4a853" }}>Souris</span><span>Regarder (clic + glisser)</span>
            <span style={{ color: "#d4a853" }}>Shift</span><span>Courir</span>
            <span style={{ color: "#d4a853" }}>Échap</span><span>Quitter</span>
          </div>
        </div>
      )}

      {isLocked && (
        <>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: "1rem",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.75rem",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            WASD : déplacer · Flèches : tourner · Souris : regarder · Échap : quitter
          </div>
        </>
      )}

      <Minimap
        roomWidth={width}
        roomLength={length}
        artworks={artworks.map((a) => ({ id: a.id, wall: a.wall, positionX: a.positionX, positionY: a.positionY }))}
        playerPosition={playerPos}
        playerRotation={playerRot}
        visible={isLocked}
      />

      <MobileControls
        onMove={() => {}}
        onLook={() => {}}
        visible={isMobile && !selectedArtwork}
      />
    </div>
  )
}
