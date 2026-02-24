import { useRef, useEffect, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
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
  enabled = true,
  onLockChange,
}: PlayerControllerProps) {
  const { camera, gl } = useThree()
  const keysRef = useRef<Record<string, boolean>>({})
  const isLockedRef = useRef(false)
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"))
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const movement = useRef(new THREE.Vector3())

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, roomLength / 2 - BOUNDS_MARGIN * 3)
    camera.rotation.set(0, Math.PI, 0)
  }, [camera, roomLength])

  const onPointerLockChange = useCallback(() => {
    const locked = document.pointerLockElement === gl.domElement
    isLockedRef.current = locked
    onLockChange?.(locked)
  }, [gl.domElement, onLockChange])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isLockedRef.current) return
    euler.current.setFromQuaternion(camera.quaternion)
    euler.current.y -= e.movementX * 0.002
    euler.current.x -= e.movementY * 0.002
    euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x))
    camera.quaternion.setFromEuler(euler.current)
  }, [camera])

  const requestLock = useCallback(() => {
    if (!isLockedRef.current) {
      gl.domElement.requestPointerLock()
    }
  }, [gl.domElement])

  useEffect(() => {
    document.addEventListener("pointerlockchange", onPointerLockChange)
    document.addEventListener("mousemove", onMouseMove)
    gl.domElement.addEventListener("click", requestLock)

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true }
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange)
      document.removeEventListener("mousemove", onMouseMove)
      gl.domElement.removeEventListener("click", requestLock)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gl.domElement, onPointerLockChange, onMouseMove, requestLock])

  useFrame((_, delta) => {
    if (!enabled || !isLockedRef.current) return

    const keys = keysRef.current
    const isRunning = keys["ShiftLeft"] || keys["ShiftRight"]
    const speed = isRunning ? RUN_SPEED : WALK_SPEED

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, new THREE.Vector3(0, 1, 0)).normalize()

    movement.current.set(0, 0, 0)

    if (keys["KeyW"] || keys["ArrowUp"]) movement.current.add(forward.current)
    if (keys["KeyS"] || keys["ArrowDown"]) movement.current.sub(forward.current)
    if (keys["KeyA"] || keys["ArrowLeft"]) movement.current.sub(right.current)
    if (keys["KeyD"] || keys["ArrowRight"]) movement.current.add(right.current)

    if (movement.current.lengthSq() > 0) {
      movement.current.normalize()
      camera.position.addScaledVector(movement.current, speed * delta)
    }

    const minX = -roomWidth / 2 + BOUNDS_MARGIN
    const maxX = roomWidth / 2 - BOUNDS_MARGIN
    const minZ = -roomLength / 2 + BOUNDS_MARGIN
    const maxZ = roomLength / 2 - BOUNDS_MARGIN

    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x))
    camera.position.y = EYE_HEIGHT
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z))
  })

  return null
}
