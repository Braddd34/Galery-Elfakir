"use client"

import { useEffect, useRef } from "react"

export interface MinimapArtwork {
  id: string
  wall: "north" | "south" | "east" | "west"
  positionX: number
  positionY: number
}

export interface MinimapProps {
  roomWidth: number
  roomLength: number
  artworks: MinimapArtwork[]
  playerPosition: { x: number; z: number }
  playerRotation: number
  visible: boolean
}

const CANVAS_SIZE = 150
const PADDING = 12
const DOORWAY_WIDTH = 2

function roomToCanvas(
  x: number,
  z: number,
  roomWidth: number,
  roomLength: number
): { x: number; y: number } {
  const innerW = CANVAS_SIZE - PADDING * 2
  const innerH = CANVAS_SIZE - PADDING * 2
  const scaleX = innerW / roomWidth
  const scaleZ = innerH / roomLength
  const scale = Math.min(scaleX, scaleZ)
  const offsetX = PADDING + (innerW - roomWidth * scale) / 2 + (roomWidth / 2 + x) * scale
  const offsetY = PADDING + (innerH - roomLength * scale) / 2 + (roomLength / 2 - z) * scale
  return { x: offsetX, y: offsetY }
}

function getArtworkCoords(
  art: MinimapArtwork,
  roomWidth: number,
  roomLength: number
): { x: number; z: number } {
  const hw = roomWidth / 2
  const hl = roomLength / 2
  switch (art.wall) {
    case "north":
      return { x: art.positionX, z: -hl }
    case "south":
      return { x: art.positionX, z: hl }
    case "east":
      return { x: hw, z: art.positionY }
    case "west":
      return { x: -hw, z: art.positionY }
    default:
      return { x: art.positionX, z: art.positionY }
  }
}

export default function Minimap({
  roomWidth,
  roomLength,
  artworks,
  playerPosition,
  playerRotation,
  visible,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visible) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const innerW = CANVAS_SIZE - PADDING * 2
    const innerH = CANVAS_SIZE - PADDING * 2
    const scaleX = innerW / roomWidth
    const scaleZ = innerH / roomLength
    const scale = Math.min(scaleX, scaleZ)
    const drawW = roomWidth * scale
    const drawH = roomLength * scale
    const ox = PADDING + (innerW - drawW) / 2
    const oy = PADDING + (innerH - drawH) / 2

    const doorStart = (drawW - DOORWAY_WIDTH * scale) / 2
    const doorEnd = doorStart + DOORWAY_WIDTH * scale

    ctx.strokeStyle = "#666"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(ox + drawW, oy)
    ctx.lineTo(ox + drawW, oy + drawH)
    ctx.lineTo(ox + doorEnd, oy + drawH)
    ctx.moveTo(ox + doorStart, oy + drawH)
    ctx.lineTo(ox, oy + drawH)
    ctx.lineTo(ox, oy)
    ctx.stroke()

    artworks.forEach((art) => {
      const { x, z } = getArtworkCoords(art, roomWidth, roomLength)
      const { x: cx, y: cy } = roomToCanvas(x, z, roomWidth, roomLength)
      ctx.fillStyle = "#d4af37"
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    const { x: px, y: py } = roomToCanvas(
      playerPosition.x,
      playerPosition.z,
      roomWidth,
      roomLength
    )
    const arrowSize = 6
    const angle = -playerRotation
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(angle)
    ctx.fillStyle = "#60a5fa"
    ctx.strokeStyle = "#93c5fd"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(arrowSize, 0)
    ctx.lineTo(-arrowSize * 0.7, arrowSize * 0.6)
    ctx.lineTo(-arrowSize * 0.4, 0)
    ctx.lineTo(-arrowSize * 0.7, -arrowSize * 0.6)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }, [roomWidth, roomLength, artworks, playerPosition, playerRotation, visible])

  if (!visible) return null

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 8,
        zIndex: 100,
      }}
    />
  )
}
