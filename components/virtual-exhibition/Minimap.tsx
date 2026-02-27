"use client"

import { useEffect, useRef } from "react"
import type { PartitionWall } from "@/lib/virtual-exhibition/types"

export interface MinimapArtwork {
  id: string
  wall: string
  positionX: number
  positionY: number
}

export interface MinimapProps {
  roomWidth: number
  roomLength: number
  artworks: MinimapArtwork[]
  partitions?: PartitionWall[]
  playerPosition: { x: number; z: number }
  playerRotation: number
  visible: boolean
}

const CANVAS_SIZE = 160
const PADDING = 14
const DOORWAY_WIDTH = 2

export default function Minimap({
  roomWidth,
  roomLength,
  artworks,
  partitions = [],
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

    function toCanvas(worldX: number, worldZ: number) {
      return {
        x: ox + (roomWidth / 2 + worldX) * scale,
        y: oy + (roomLength / 2 - worldZ) * scale,
      }
    }

    const doorHalf = (DOORWAY_WIDTH * scale) / 2
    const doorCx = ox + drawW / 2

    ctx.strokeStyle = "#666"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(ox + drawW, oy)
    ctx.lineTo(ox + drawW, oy + drawH)
    ctx.lineTo(doorCx + doorHalf, oy + drawH)
    ctx.moveTo(doorCx - doorHalf, oy + drawH)
    ctx.lineTo(ox, oy + drawH)
    ctx.lineTo(ox, oy)
    ctx.stroke()

    ctx.strokeStyle = "#555"
    ctx.lineWidth = 2
    for (const part of partitions) {
      const cx = part.position[0]
      const cz = part.position[2]
      const hw = part.width / 2
      const isHoriz = Math.abs(part.rotationY) < 0.01

      let x1: number, z1: number, x2: number, z2: number
      if (isHoriz) {
        x1 = cx - hw; z1 = cz; x2 = cx + hw; z2 = cz
      } else {
        x1 = cx; z1 = cz - hw; x2 = cx; z2 = cz + hw
      }

      const p1 = toCanvas(x1, z1)
      const p2 = toCanvas(x2, z2)
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }

    for (const art of artworks) {
      const p = toCanvas(0, 0)
      ctx.fillStyle = "#d4af37"
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    const pp = toCanvas(playerPosition.x, playerPosition.z)
    const arrowSize = 6
    const angle = -playerRotation
    ctx.save()
    ctx.translate(pp.x, pp.y)
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
  }, [roomWidth, roomLength, artworks, partitions, playerPosition, playerRotation, visible])

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
