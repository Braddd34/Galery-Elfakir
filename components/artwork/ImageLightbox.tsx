"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface ImageLightboxProps {
  images: { url: string }[]
  alt: string
}

/**
 * Composant lightbox pour zoomer sur les images des œuvres.
 * Affiche l'image principale et permet de naviguer entre les images.
 * Supporte le zoom molette, le drag pour déplacer, et le double-clic pour zoomer.
 */
export default function ImageLightbox({ images, alt }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  // Ouvrir le lightbox sur une image spécifique
  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setIsOpen(true)
  }

  // Fermer le lightbox
  const closeLightbox = () => {
    setIsOpen(false)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Navigation entre les images
  const goNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % images.length)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [images.length])

  const goPrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + images.length) % images.length)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [images.length])

  // Zoom avec la molette
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => {
      const newZoom = prev - e.deltaY * 0.001
      return Math.max(0.5, Math.min(5, newZoom))
    })
  }, [])

  // Double-clic pour zoom toggle
  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setZoom(2.5)
    }
  }, [zoom])

  // Drag pour déplacer l'image zoomée
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, zoom, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Raccourcis clavier
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox()
          break
        case "ArrowRight":
          goNext()
          break
        case "ArrowLeft":
          goPrev()
          break
        case "+":
        case "=":
          setZoom(prev => Math.min(5, prev + 0.5))
          break
        case "-":
          setZoom(prev => Math.max(0.5, prev - 0.5))
          break
      }
    }

    // Bloquer le scroll du body
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, goNext, goPrev])

  return (
    <>
      {/* Galerie cliquable */}
      <div className="space-y-4">
        {/* Image principale */}
        <div
          className="aspect-[4/5] bg-neutral-900 cursor-zoom-in relative group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[activeIndex]?.url || images[0]?.url}
            alt={alt}
            className="w-full h-full object-cover"
          />
          {/* Icône zoom */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className={`aspect-square bg-neutral-900 cursor-pointer transition-opacity ${
                  i === activeIndex ? "ring-1 ring-white" : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => {
                  setActiveIndex(i)
                }}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          {/* Bouton fermer */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 p-3 text-white/70 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Contrôles de zoom */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.5))}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Dézoomer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-white/70 text-sm min-w-[4ch] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(5, prev + 0.5))}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Zoomer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }) }}
              className="text-white/70 hover:text-white text-xs ml-2 transition-colors"
              aria-label="Réinitialiser le zoom"
            >
              Reset
            </button>
          </div>

          {/* Navigation gauche */}
          {images.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/50 hover:text-white transition-colors"
              aria-label="Image précédente"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image zoomable */}
          <div
            ref={imageRef}
            className={`w-full h-full flex items-center justify-center overflow-hidden ${
              zoom > 1 ? "cursor-grab" : "cursor-zoom-in"
            } ${isDragging ? "cursor-grabbing" : ""}`}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={images[activeIndex]?.url}
              alt={alt}
              className="max-w-[90vw] max-h-[85vh] object-contain select-none"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out"
              }}
              draggable={false}
            />
          </div>

          {/* Navigation droite */}
          {images.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/50 hover:text-white transition-colors"
              aria-label="Image suivante"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Compteur d'images */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
              {/* Miniatures en bas */}
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveIndex(i); setZoom(1); setPosition({ x: 0, y: 0 }) }}
                    className={`w-16 h-16 overflow-hidden transition-all ${
                      i === activeIndex ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-80"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-6 right-6 text-white/30 text-xs space-y-1">
            <p>Molette : zoomer · Double-clic : zoom 250%</p>
            <p>← → : naviguer · Échap : fermer</p>
          </div>
        </div>
      )}
    </>
  )
}
