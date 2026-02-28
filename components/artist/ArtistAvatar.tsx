"use client"

import { useState } from "react"
import { DEFAULT_AVATAR } from "@/lib/constants"

interface ArtistAvatarProps {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  className?: string
  width?: number
  height?: number
}

/**
 * Affiche la photo de l'artiste avec une balise <img> native.
 * Évite les soucis d'optimisation Next.js / proxy et gère l'échec de chargement.
 */
export default function ArtistAvatar({
  src,
  alt,
  fill,
  className,
  width = 200,
  height = 200,
}: ArtistAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)

  const handleError = () => {
    if (!failed) {
      setFailed(true)
      setCurrentSrc(DEFAULT_AVATAR)
    }
  }

  const displaySrc = currentSrc || DEFAULT_AVATAR

  if (fill) {
    return (
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        onError={handleError}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
      />
    )
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
}
