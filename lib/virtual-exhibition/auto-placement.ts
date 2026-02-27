import type { WallSegment, PlacedArtwork } from "./types"

const CM_TO_M = 0.01
const MAX_ARTWORK_M = 2.0
const MIN_SPACING_M = 1.2

interface ArtworkInput {
  index: number
  width: number
  height: number
}

/**
 * Returns the effective width of an artwork in meters after capping to MAX_ARTWORK_M.
 */
function artworkWidthM(widthCm: number, heightCm: number, scale: number): number {
  const w = widthCm * CM_TO_M
  const h = heightCm * CM_TO_M
  const maxDim = Math.max(w, h)
  const factor = maxDim > MAX_ARTWORK_M ? MAX_ARTWORK_M / maxDim : 1
  return w * factor * scale
}

/**
 * Automatically distributes artworks across wall segments with even spacing.
 *
 * Algorithm:
 * 1. Sort artworks by size (largest first) for balanced distribution
 * 2. Assign artworks to segments via weighted round-robin (by capacity)
 * 3. Within each segment, compute even horizontal spacing
 * 4. All artworks centered vertically (positionY = 0.5)
 * 5. Scale down if an artwork is too wide for the available slot
 */
export function autoPlaceArtworks(
  artworks: { width: number; height: number }[],
  segments: WallSegment[]
): PlacedArtwork[] {
  if (artworks.length === 0 || segments.length === 0) return []

  const usable = segments.filter((s) => s.capacity > 0)
  if (usable.length === 0) return []

  const inputs: ArtworkInput[] = artworks.map((a, i) => ({
    index: i,
    width: a.width,
    height: a.height,
  }))

  inputs.sort(
    (a, b) =>
      Math.max(b.width, b.height) - Math.max(a.width, a.height)
  )

  const totalCapacity = usable.reduce((s, seg) => s + seg.capacity, 0)
  const assigned: Map<string, ArtworkInput[]> = new Map()
  for (const seg of usable) assigned.set(seg.id, [])

  const fillLevel: Map<string, number> = new Map()
  for (const seg of usable) fillLevel.set(seg.id, 0)

  for (const art of inputs) {
    let bestSeg = usable[0]
    let bestScore = -Infinity

    for (const seg of usable) {
      const current = fillLevel.get(seg.id)!
      if (current >= seg.capacity) continue
      const ratio = 1 - current / seg.capacity
      if (ratio > bestScore) {
        bestScore = ratio
        bestSeg = seg
      }
    }

    assigned.get(bestSeg.id)!.push(art)
    fillLevel.set(bestSeg.id, (fillLevel.get(bestSeg.id) ?? 0) + 1)
  }

  const result: PlacedArtwork[] = []

  for (const seg of usable) {
    const arts = assigned.get(seg.id)!
    if (arts.length === 0) continue

    const count = arts.length
    for (let i = 0; i < count; i++) {
      const art = arts[i]
      const posX = (i + 0.5) / count

      const slotWidth = seg.width / count
      const effectiveW = artworkWidthM(art.width, art.height, 1)
      const neededSpace = effectiveW + MIN_SPACING_M
      const scale = neededSpace > slotWidth ? Math.max(0.4, slotWidth / neededSpace) : 1

      result.push({
        artworkIndex: art.index,
        segmentId: seg.id,
        positionX: posX,
        positionY: 0.5,
        scale,
      })
    }
  }

  result.sort((a, b) => a.artworkIndex - b.artworkIndex)
  return result
}
