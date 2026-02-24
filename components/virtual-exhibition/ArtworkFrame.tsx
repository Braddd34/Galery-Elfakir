import { useRef, useState, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const FRAME_BORDER = 0.03
const MAX_DIMENSION_M = 2
const CM_TO_M = 0.01

const fallbackTexture = (() => {
  const canvas = document.createElement ? null : null
  const data = new Uint8Array(3)
  data[0] = 136
  data[1] = 136
  data[2] = 136
  const tex = new THREE.DataTexture(data, 1, 1)
  tex.needsUpdate = true
  return tex
})()

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
  wall: "north" | "south" | "east" | "west"
  positionX: number
  positionY: number
  scale?: number
  roomWidth: number
  roomLength: number
  roomHeight: number
  isHighlighted?: boolean
  onClick: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

function useArtworkTexture(imageUrl: string): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(fallbackTexture)

  useEffect(() => {
    if (!imageUrl || !imageUrl.startsWith("http")) {
      setTexture(fallbackTexture)
      return
    }

    const encodedUrl = encodeURI(imageUrl)
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = "anonymous"

    loader.load(
      encodedUrl,
      (loadedTexture) => {
        setTexture(loadedTexture)
      },
      undefined,
      () => {
        setTexture(fallbackTexture)
      }
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
  wall,
  positionX,
  positionY,
  scale = 1,
  roomWidth,
  roomLength,
  roomHeight,
  isHighlighted = false,
  onClick,
  onPointerOver,
  onPointerOut,
}: ArtworkFrameProps) {
  const meshRef = useRef<THREE.Group>(null)
  const spotlightRef = useRef<THREE.SpotLight>(null)

  const texture = useArtworkTexture(artwork.imageUrl)

  const { frameWidth, frameHeight, position, rotation } = useMemo(() => {
    const wCm = artwork.width * CM_TO_M
    const hCm = artwork.height * CM_TO_M
    const maxDim = Math.max(wCm, hCm)
    const scaleFactor = maxDim > MAX_DIMENSION_M ? MAX_DIMENSION_M / maxDim : 1
    const imgW = wCm * scaleFactor * scale
    const imgH = hCm * scaleFactor * scale
    const fw = imgW + FRAME_BORDER * 2
    const fh = imgH + FRAME_BORDER * 2

    const yPos = 1.0 + (roomHeight - 1.5) * positionY

    let x = 0
    let z = 0
    let rotY = 0

    const halfWidth = roomWidth / 2
    const halfLength = roomLength / 2

    switch (wall) {
      case "north":
        z = -halfLength + 0.02
        x = -halfWidth + roomWidth * positionX
        rotY = 0
        break
      case "south":
        z = halfLength - 0.02
        x = -halfWidth + roomWidth * positionX
        rotY = Math.PI
        break
      case "east":
        x = halfWidth - 0.02
        z = -halfLength + roomLength * positionX
        rotY = -Math.PI / 2
        break
      case "west":
        x = -halfWidth + 0.02
        z = -halfLength + roomLength * positionX
        rotY = Math.PI / 2
        break
    }

    return {
      frameWidth: fw,
      frameHeight: fh,
      position: [x, yPos, z] as [number, number, number],
      rotation: [0, rotY, 0] as [number, number, number],
    }
  }, [artwork.width, artwork.height, wall, positionX, positionY, roomWidth, roomLength, roomHeight, scale])

  const spotlightIntensity = isHighlighted ? 2.5 : 1.5
  const frameEmissive = isHighlighted ? "#4a3a20" : "#000000"

  useFrame(() => {
    if (spotlightRef.current) {
      spotlightRef.current.intensity +=
        (spotlightIntensity - spotlightRef.current.intensity) * 0.1
    }
  })

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
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
        color="#fff5e6"
      />
    </group>
  )
}
