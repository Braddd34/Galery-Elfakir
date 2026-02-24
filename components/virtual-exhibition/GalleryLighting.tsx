import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

interface GalleryLightingProps {
  theme: "white" | "dark"
  roomHeight?: number
}

export default function GalleryLighting({
  theme,
  roomHeight = 4,
}: GalleryLightingProps) {
  const { scene } = useThree()

  useEffect(() => {
    if (theme === "white") {
      scene.background = new THREE.Color("#f5f5f0")
      scene.fog = new THREE.Fog(0xf5f5f0, 15, 35)
    } else {
      scene.background = new THREE.Color("#0a0a0a")
      scene.fog = new THREE.Fog(0x0a0a0a, 10, 25)
    }
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene, theme])

  const ceilingLights = useMemo(() => {
    const positions: [number, number, number][] = [
      [-3, roomHeight, -4],
      [3, roomHeight, -4],
      [-3, roomHeight, 4],
      [3, roomHeight, 4],
    ]
    return positions.map((pos) => {
      const light = new THREE.RectAreaLight(0xffffff, 0.8, 5, 5)
      light.position.set(...pos)
      light.rotation.set(-Math.PI / 2, 0, 0)
      return light
    })
  }, [roomHeight])

  return (
    <>
      {theme === "white" ? (
        <>
          <ambientLight color="#fff5e6" intensity={0.6} />
          <hemisphereLight
            color="#ffffff"
            groundColor="#e8dcc8"
            intensity={0.3}
          />
          {ceilingLights.map((light, i) => (
            <primitive key={i} object={light} />
          ))}
        </>
      ) : (
        <>
          <ambientLight color="#1a1510" intensity={0.15} />
          <hemisphereLight
            color="#1a1510"
            groundColor="#0a0a0a"
            intensity={0.05}
          />
        </>
      )}
    </>
  )
}
