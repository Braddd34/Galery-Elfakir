"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
}

// Image placeholder de fallback
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"

export default function OptimizedImage({
  src,
  alt,
  className = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const imageSrc = error ? FALLBACK_IMAGE : src

  return (
    <div className={`relative ${fill ? "w-full h-full" : ""} ${className}`}>
      {/* Skeleton pendant le chargement */}
      {loading && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
      )}
      
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true)
            setLoading(false)
          }}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          sizes={sizes}
          priority={priority}
          className={`transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true)
            setLoading(false)
          }}
        />
      )}
    </div>
  )
}
