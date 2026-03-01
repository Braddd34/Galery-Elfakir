import { useRef, useState, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { encodeImageUrl } from "@/lib/image-utils"
import type { WallSegment } from "@/lib/virtual-exhibition/types"
import type { ThemeId } from "@/lib/virtual-exhibition/types"

const FRAME_BORDER = 0.03
const MAX_DIMENSION_M = 2
const CM_TO_M = 0.01
const WALL_GAP = 0.01

const fallbackTexture = (() => {
  const data = new Uint8Array(4)
  data[0] = 136
  data[1] = 136
  data[2] = 136
  data[3] = 255
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat)
  tex.needsUpdate = true
  return tex
})()

const SPOT_COLOR_BY_THEME: Record<ThemeId, string> = {
  white: "#fff5e6",
  dark: "#fff0e0",
  concrete: "#e8e8e4",
  wood: "#ffe8d0",
}

interface ArtworkFrameProps {
  artwork: {
    id: string
    title: string
    artistName: string
    price: number
    slug: string
    imageUrl: string
    width: number
    height: number
  }
  segment: WallSegment
  positionX: number
  positionY: number
  scale?: number
  theme?: ThemeId
  isHighlighted?: boolean
  onClick: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

function useArtworkTexture(imageUrl: string): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(fallbackTexture)

  useEffect(() => {
    if (!imageUrl || imageUrl.length < 2) {
      setTexture(fallbackTexture)
      return
    }

    const finalUrl = imageUrl.startsWith("/") ? imageUrl : encodeImageUrl(imageUrl)
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = "anonymous"

    loader.load(
      finalUrl,
      (loaded) => setTexture(loaded),
      undefined,
      () => setTexture(fallbackTexture)
    )

    return () => {
      if (texture && texture !== fallbackTexture) {
        texture.dispose()
      }
    }
  }, [imageUrl])

  return texture
}

export default function ArtworkFrame({
  artwork,
  segment,
  positionX,
  positionY,
  scale = 1,
  theme = "white",
  isHighlighted = false,
  onClick,
  onPointerOver,
  onPointerOut,
}: ArtworkFrameProps) {
  const meshRef = useRef<THREE.Group>(null)
  const spotlightRef = useRef<THREE.SpotLight>(null)
  const texture = useArtworkTexture(artwork.imageUrl)
  const spotColor = SPOT_COLOR_BY_THEME[theme] ?? SPOT_COLOR_BY_THEME.white

  const { frameWidth, frameHeight, localX, localY } = useMemo(() => {
    const wCm = artwork.width * CM_TO_M
    const hCm = artwork.height * CM_TO_M
    const maxDim = Math.max(wCm, hCm)
    const scaleFactor = maxDim > MAX_DIMENSION_M ? MAX_DIMENSION_M / maxDim : 1
    const imgW = wCm * scaleFactor * scale
    const imgH = hCm * scaleFactor * scale
    const fw = imgW + FRAME_BORDER * 2
    const fh = imgH + FRAME_BORDER * 2

    const lx = (positionX - 0.5) * segment.width
    const ly = 1.0 + (segment.height - 1.5) * positionY - segment.height / 2

    return { frameWidth: fw, frameHeight: fh, localX: lx, localY: ly }
  }, [artwork.width, artwork.height, positionX, positionY, segment.width, segment.height, scale])

  const spotlightIntensity = isHighlighted ? 2.5 : 1.5
  const frameEmissive = isHighlighted ? "#4a3a20" : "#000000"

  useFrame(() => {
    if (spotlightRef.current) {
      spotlightRef.current.intensity +=
        (spotlightIntensity - spotlightRef.current.intensity) * 0.1
    }
  })

  return (
    <group position={segment.position} rotation={segment.rotation}>
      <group
        ref={meshRef}
        position={[localX, localY, WALL_GAP]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
          onPointerOver?.()
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default"
          onPointerOut?.()
        }}
      >
        <mesh position={[0, 0, FRAME_BORDER / 2]}>
          <boxGeometry args={[frameWidth, frameHeight, FRAME_BORDER]} />
          <meshStandardMaterial
            color="#3a2a1a"
            emissive={frameEmissive}
            emissiveIntensity={isHighlighted ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[0, 0, FRAME_BORDER + 0.001]}>
          <planeGeometry args={[frameWidth - FRAME_BORDER * 2, frameHeight - FRAME_BORDER * 2]} />
          <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
        <spotLight
          ref={spotlightRef}
          position={[0, frameHeight / 2 + 0.5, 1]}
          angle={0.4}
          penumbra={0.5}
          intensity={spotlightIntensity}
          color={spotColor}
          castShadow
          shadow-mapSize={[512, 512]}
        />
      </group>
    </group>
  )
}
