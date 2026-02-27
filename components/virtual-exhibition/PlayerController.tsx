import { useRef, useEffect, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const WALK_SPEED = 3
const RUN_SPEED = 6
const EYE_HEIGHT = 1.7
const BOUNDS_MARGIN = 0.5
const MOUSE_SENSITIVITY = 0.003
const ARROW_ROTATE_SPEED = 2

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
  const isDraggingRef = useRef(false)
  const hasEnteredRef = useRef(false)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const movement = useRef(new THREE.Vector3())

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 0)
    yawRef.current = 0
    pitchRef.current = 0
    camera.rotation.set(0, 0, 0)
  }, [camera, roomLength])

  const updateCameraRotation = useCallback(() => {
    pitchRef.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitchRef.current))
    const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ")
    camera.quaternion.setFromEuler(euler)
  }, [camera])

  const onPointerLockChange = useCallback(() => {
    const locked = document.pointerLockElement === gl.domElement
    isLockedRef.current = locked
    if (locked) hasEnteredRef.current = true
    onLockChange?.(locked && hasEnteredRef.current)
  }, [gl.domElement, onLockChange])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isLockedRef.current) {
      yawRef.current -= e.movementX * MOUSE_SENSITIVITY
      pitchRef.current -= e.movementY * MOUSE_SENSITIVITY
      updateCameraRotation()
    } else if (isDraggingRef.current && hasEnteredRef.current) {
      yawRef.current -= e.movementX * MOUSE_SENSITIVITY
      pitchRef.current -= e.movementY * MOUSE_SENSITIVITY
      updateCameraRotation()
    }
  }, [updateCameraRotation])

  const handleCanvasClick = useCallback(() => {
    if (!hasEnteredRef.current) {
      hasEnteredRef.current = true
      onLockChange?.(true)
    }
    if (!isLockedRef.current) {
      try {
        gl.domElement.requestPointerLock()
      } catch {
        // Pointer lock not supported, use drag mode
      }
    }
  }, [gl.domElement, onLockChange])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isLockedRef.current && hasEnteredRef.current && e.button === 0) {
      isDraggingRef.current = true
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    document.addEventListener("pointerlockchange", onPointerLockChange)
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    gl.domElement.addEventListener("click", handleCanvasClick)
    gl.domElement.addEventListener("mousedown", handleMouseDown)

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true }
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      gl.domElement.removeEventListener("click", handleCanvasClick)
      gl.domElement.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gl.domElement, onPointerLockChange, onMouseMove, handleCanvasClick, handleMouseDown, handleMouseUp])

  useFrame((_, delta) => {
    if (!enabled || !hasEnteredRef.current) return

    const keys = keysRef.current
    const isRunning = keys["ShiftLeft"] || keys["ShiftRight"]
    const speed = isRunning ? RUN_SPEED : WALK_SPEED

    if (keys["ArrowLeft"]) {
      yawRef.current += ARROW_ROTATE_SPEED * delta
      updateCameraRotation()
    }
    if (keys["ArrowRight"]) {
      yawRef.current -= ARROW_ROTATE_SPEED * delta
      updateCameraRotation()
    }
    if (keys["ArrowUp"]) {
      pitchRef.current += ARROW_ROTATE_SPEED * delta * 0.5
      updateCameraRotation()
    }
    if (keys["ArrowDown"]) {
      pitchRef.current -= ARROW_ROTATE_SPEED * delta * 0.5
      updateCameraRotation()
    }

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, new THREE.Vector3(0, 1, 0)).normalize()

    movement.current.set(0, 0, 0)

    if (keys["KeyW"]) movement.current.add(forward.current)
    if (keys["KeyS"]) movement.current.sub(forward.current)
    if (keys["KeyA"]) movement.current.sub(right.current)
    if (keys["KeyD"]) movement.current.add(right.current)

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
