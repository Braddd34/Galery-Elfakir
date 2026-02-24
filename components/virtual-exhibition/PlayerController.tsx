import { useRef, useEffect, useCallback, useState } from "react"
import { createPortal } from "react-dom"
import { useThree, useFrame } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import * as THREE from "three"

const WALK_SPEED = 3
const RUN_SPEED = 6
const EYE_HEIGHT = 1.7
const COLLISION_DISTANCE = 0.5
const BOUNDS_MARGIN = 0.5

interface PlayerControllerProps {
  roomWidth: number
  roomLength: number
  roomHeight: number
  enabled?: boolean
  onLockChange?: (locked: boolean) => void
}

export default function PlayerController({
  roomWidth,
  roomLength,
  roomHeight,
  enabled = true,
  onLockChange,
}: PlayerControllerProps) {
  const { camera, scene, controls } = useThree()
  const keysRef = useRef<Set<string>>(new Set())
  const [locked, setLocked] = useState(false)
  const raycaster = useRef(new THREE.Raycaster())
  const rayOrigin = useRef(new THREE.Vector3())
  const rayDirection = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const movement = useRef(new THREE.Vector3())
  const meshesRef = useRef<THREE.Object3D[]>([])

  const handleLock = useCallback(() => {
    setLocked(true)
    onLockChange?.(true)
  }, [onLockChange])

  const handleUnlock = useCallback(() => {
    setLocked(false)
    onLockChange?.(false)
  }, [onLockChange])

  useEffect(() => {
    const meshes: THREE.Object3D[] = []
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        meshes.push(obj)
      }
    })
    meshesRef.current = meshes
  }, [scene])

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, roomLength / 2 - BOUNDS_MARGIN * 3)
    camera.rotation.set(0, 0, 0)
  }, [camera, roomLength])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const codes = ["KeyW", "KeyS", "KeyA", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"]
      if (codes.includes(e.code)) {
        keysRef.current.add(e.code)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!enabled || !controls) return

    const keys = keysRef.current
    const isRunning = keys.has("ShiftLeft") || keys.has("ShiftRight")
    const speed = isRunning ? RUN_SPEED : WALK_SPEED

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()

    right.current.crossVectors(forward.current, new THREE.Vector3(0, 1, 0))
    right.current.normalize()

    movement.current.set(0, 0, 0)

    if (keys.has("KeyW") || keys.has("ArrowUp")) {
      movement.current.add(forward.current)
    }
    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      movement.current.sub(forward.current)
    }
    if (keys.has("KeyA") || keys.has("ArrowLeft")) {
      movement.current.sub(right.current)
    }
    if (keys.has("KeyD") || keys.has("ArrowRight")) {
      movement.current.add(right.current)
    }

    if (movement.current.lengthSq() > 0) {
      movement.current.normalize()
      const moveLength = speed * delta

      rayOrigin.current.copy(camera.position)
      rayDirection.current.copy(movement.current)
      raycaster.current.set(rayOrigin.current, rayDirection.current)
      raycaster.current.far = moveLength + COLLISION_DISTANCE

      const intersects = raycaster.current.intersectObjects(meshesRef.current, true)
      const hit = intersects[0]

      let allowedMove = moveLength
      if (hit) {
        if (hit.distance < COLLISION_DISTANCE) {
          allowedMove = 0
        } else if (hit.distance < moveLength + COLLISION_DISTANCE) {
          allowedMove = Math.max(0, hit.distance - COLLISION_DISTANCE)
        }
      }
      if (allowedMove > 0) {
        camera.position.addScaledVector(movement.current, allowedMove)
      }
    }

    const minX = -roomWidth / 2 + BOUNDS_MARGIN
    const maxX = roomWidth / 2 - BOUNDS_MARGIN
    const minZ = -roomLength / 2 + BOUNDS_MARGIN
    const maxZ = roomLength / 2 - BOUNDS_MARGIN

    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x))
    camera.position.y = EYE_HEIGHT
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z))
  })

  if (!enabled) return null

  return (
    <>
      <PointerLockControls
        makeDefault
        onLock={handleLock}
        onUnlock={handleUnlock}
      />
      {createPortal(
        <div
          style={{
            display: locked ? "none" : "flex",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            zIndex: 1000,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Cliquez pour entrer dans l&apos;exposition
          </p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            WASD ou flèches : se déplacer · Souris : regarder · Shift : courir · Échap : quitter
          </p>
        </div>,
        document.body
      )}
    </>
  )
}
