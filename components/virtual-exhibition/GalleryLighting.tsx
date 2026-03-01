import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { ThemeId } from "@/lib/virtual-exhibition/types"

interface GalleryLightingProps {
  theme: ThemeId
  roomHeight?: number
  roomWidth?: number
  roomLength?: number
}

const themeLighting: Record<
  ThemeId,
  {
    background: string
    ambientColor: string
    ambientIntensity: number
    hemisphereColor: string
    hemisphereGround: string
    hemisphereIntensity: number
    pointColor: string
    pointIntensity: number
    pointDistance: number
  }
> = {
  white: {
    background: "#d4cfc6",
    ambientColor: "#ffffff",
    ambientIntensity: 0.8,
    hemisphereColor: "#ffffff",
    hemisphereGround: "#e8dcc8",
    hemisphereIntensity: 0.5,
    pointColor: "#ffffff",
    pointIntensity: 0.8,
    pointDistance: 25,
  },
  dark: {
    background: "#181818",
    ambientColor: "#e8e4e0",
    ambientIntensity: 0.45,
    hemisphereColor: "#c0b8b0",
    hemisphereGround: "#2a2826",
    hemisphereIntensity: 0.22,
    pointColor: "#fff5e8",
    pointIntensity: 0.85,
    pointDistance: 24,
  },
  concrete: {
    background: "#3a3a38",
    ambientColor: "#c0c0c0",
    ambientIntensity: 0.6,
    hemisphereColor: "#b0b0b0",
    hemisphereGround: "#505050",
    hemisphereIntensity: 0.3,
    pointColor: "#f0e8d8",
    pointIntensity: 0.7,
    pointDistance: 25,
  },
  wood: {
    background: "#c8bfb0",
    ambientColor: "#fff8ee",
    ambientIntensity: 0.7,
    hemisphereColor: "#fff4e0",
    hemisphereGround: "#c8a878",
    hemisphereIntensity: 0.4,
    pointColor: "#ffe8c0",
    pointIntensity: 0.8,
    pointDistance: 25,
  },
}

export default function GalleryLighting({
  theme,
  roomHeight = 3.5,
  roomWidth = 8,
  roomLength = 10,
}: GalleryLightingProps) {
  const { scene } = useThree()
  const cfg = themeLighting[theme] ?? themeLighting.white

  useEffect(() => {
    scene.background = new THREE.Color(cfg.background)
    scene.fog = null
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene, cfg.background])

  const lightGrid = useMemo(() => {
    const spacing = 6
    const cols = Math.max(2, Math.ceil(roomWidth / spacing))
    const rows = Math.max(2, Math.ceil(roomLength / spacing))
    const points: [number, number, number][] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -roomWidth / 2 + (roomWidth / cols) * (c + 0.5)
        const z = -roomLength / 2 + (roomLength / rows) * (r + 0.5)
        points.push([x, roomHeight - 0.2, z])
      }
    }
    return points
  }, [roomWidth, roomLength, roomHeight])

  return (
    <>
      <ambientLight color={cfg.ambientColor} intensity={cfg.ambientIntensity} />
      <hemisphereLight
        color={cfg.hemisphereColor}
        groundColor={cfg.hemisphereGround}
        intensity={cfg.hemisphereIntensity}
      />
      {lightGrid.map((pos, i) => (
        <pointLight
          key={`light-${i}`}
          position={pos}
          intensity={cfg.pointIntensity}
          color={cfg.pointColor}
          distance={cfg.pointDistance}
        />
      ))}
    </>
  )
}
