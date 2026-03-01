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
    background: "#f2f0ec",
    ambientColor: "#fffaf5",
    ambientIntensity: 0.5,
    hemisphereColor: "#ffffff",
    hemisphereGround: "#e8e6e2",
    hemisphereIntensity: 0.4,
    pointColor: "#fff5eb",
    pointIntensity: 0.6,
    pointDistance: 25,
  },
  dark: {
    background: "#0d0d0d",
    ambientColor: "#e8e4e0",
    ambientIntensity: 0.35,
    hemisphereColor: "#a0a0a0",
    hemisphereGround: "#1a1a1a",
    hemisphereIntensity: 0.2,
    pointColor: "#fff0e0",
    pointIntensity: 0.75,
    pointDistance: 24,
  },
  concrete: {
    background: "#5a5a58",
    ambientColor: "#c8c8c8",
    ambientIntensity: 0.45,
    hemisphereColor: "#b8b8b8",
    hemisphereGround: "#6a6a68",
    hemisphereIntensity: 0.35,
    pointColor: "#e8e8e4",
    pointIntensity: 0.65,
    pointDistance: 25,
  },
  wood: {
    background: "#e0d8cc",
    ambientColor: "#fff8f0",
    ambientIntensity: 0.55,
    hemisphereColor: "#fff8f0",
    hemisphereGround: "#b89870",
    hemisphereIntensity: 0.45,
    pointColor: "#fff0e0",
    pointIntensity: 0.7,
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
      <directionalLight
        position={[0, roomHeight + 2, 0]}
        intensity={0.35}
        color="#ffffff"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-roomWidth, roomWidth, roomLength, -roomLength, 0.5, roomHeight + 10]} />
      </directionalLight>
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
