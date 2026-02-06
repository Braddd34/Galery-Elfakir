"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
}

/**
 * OptimizedImage - Composant Image optimisé avec placeholder blur
 * 
 * Caractéristiques :
 * - Placeholder blur pendant le chargement
 * - Gestion des erreurs avec fallback
 * - Lazy loading automatique
 * - Styles de transition fluides
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Image de fallback en cas d'erreur
  const fallbackSrc = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
  
  // Placeholder blur SVG minimaliste (gris neutre)
  const blurDataURL = `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width || 800} ${height || 600}">
      <filter id="blur" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#262626" filter="url(#blur)"/>
    </svg>`
  )}`

  const imageProps = {
    src: error ? fallbackSrc : src,
    alt,
    className: `transition-all duration-500 ${
      isLoading ? "scale-105 blur-lg" : "scale-100 blur-0"
    } ${className}`,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setError(true)
      setIsLoading(false)
    },
    placeholder: "blur" as const,
    blurDataURL,
    priority,
    sizes: sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        style={{ objectFit: "cover" }}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width || 800}
      height={height || 600}
    />
  )
}

/**
 * Composant pour les images d'arrière-plan avec overlay
 */
interface BackgroundImageProps {
  src: string
  alt: string
  children?: React.ReactNode
  overlay?: boolean
  overlayOpacity?: number
  className?: string
}

export function BackgroundImage({
  src,
  alt,
  children,
  overlay = true,
  overlayOpacity = 50,
  className = "",
}: BackgroundImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
      />
      {overlay && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
