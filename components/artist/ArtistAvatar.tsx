"use client"

import Image from "next/image"
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
 * Affiche la photo de l'artiste. En cas d'échec de chargement (503, 404, etc.),
 * affiche le placeholder avec point d'interrogation.
 */
export default function ArtistAvatar({ src, alt, fill, sizes, className, width = 200, height = 200 }: ArtistAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleError = () => {
    setCurrentSrc(DEFAULT_AVATAR)
  }

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
}
