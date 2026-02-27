"use client"

import Image, { ImageProps } from "next/image"

function hasNonAscii(url: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /[^\x00-\x7F]/.test(url)
}

/**
 * Wrapper autour de next/image qui contourne l'optimiseur
 * pour les URLs contenant des caractères spéciaux (°, accents, etc.)
 * qui font crasher le proxy /_next/image avec une 503.
 */
export default function SafeImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : ""
  const needsUnoptimized = hasNonAscii(src)

  return <Image {...props} unoptimized={needsUnoptimized || props.unoptimized} />
}
