import { useEffect } from "react"
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
          <pointLight position={[-3, roomHeight - 0.1, -4]} intensity={0.6} color="#ffffff" distance={12} />
          <pointLight position={[3, roomHeight - 0.1, -4]} intensity={0.6} color="#ffffff" distance={12} />
          <pointLight position={[-3, roomHeight - 0.1, 4]} intensity={0.6} color="#ffffff" distance={12} />
          <pointLight position={[3, roomHeight - 0.1, 4]} intensity={0.6} color="#ffffff" distance={12} />
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
