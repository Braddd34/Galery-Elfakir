import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

interface GalleryLightingProps {
  theme: "white" | "dark"
  roomHeight?: number
  roomWidth?: number
  roomLength?: number
}

export default function GalleryLighting({
  theme,
  roomHeight = 3.5,
  roomWidth = 8,
  roomLength = 10,
}: GalleryLightingProps) {
  const { scene } = useThree()

  useEffect(() => {
    if (theme === "white") {
      scene.background = new THREE.Color("#d4cfc6")
      scene.fog = null
    } else {
      scene.background = new THREE.Color("#050505")
      scene.fog = null
    }
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene, theme])

  const qw = roomWidth / 4
  const ql = roomLength / 4

  return (
    <>
      {theme === "white" ? (
        <>
          <ambientLight color="#ffffff" intensity={0.8} />
          <hemisphereLight
            color="#ffffff"
            groundColor="#e8dcc8"
            intensity={0.5}
          />
          <pointLight position={[-qw, roomHeight - 0.2, -ql]} intensity={0.8} color="#ffffff" distance={20} />
          <pointLight position={[qw, roomHeight - 0.2, -ql]} intensity={0.8} color="#ffffff" distance={20} />
          <pointLight position={[-qw, roomHeight - 0.2, ql]} intensity={0.8} color="#ffffff" distance={20} />
          <pointLight position={[qw, roomHeight - 0.2, ql]} intensity={0.8} color="#ffffff" distance={20} />
          <pointLight position={[0, roomHeight - 0.2, 0]} intensity={0.6} color="#ffffff" distance={20} />
        </>
      ) : (
        <>
          <ambientLight color="#2a2018" intensity={0.25} />
          <hemisphereLight
            color="#1a1510"
            groundColor="#0a0a0a"
            intensity={0.1}
          />
          <pointLight position={[0, roomHeight - 0.2, 0]} intensity={0.5} color="#ffddaa" distance={20} />
          <pointLight position={[-qw, roomHeight - 0.2, -ql]} intensity={0.3} color="#ffddaa" distance={15} />
          <pointLight position={[qw, roomHeight - 0.2, ql]} intensity={0.3} color="#ffddaa" distance={15} />
        </>
      )}
    </>
  )
}
