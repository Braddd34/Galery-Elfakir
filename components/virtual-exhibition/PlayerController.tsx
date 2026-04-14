import { useRef, useEffect, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { PartitionWall } from "@/lib/virtual-exhibition/types"

const WALK_SPEED = 3
const RUN_SPEED = 6
const EYE_HEIGHT = 1.8
const BOUNDS_MARGIN = 0.5
const MOUSE_SENSITIVITY = 0.002
const ARROW_ROTATE_SPEED = 1.8
const COLLISION_MARGIN = 0.35
const MOVE_SMOOTH = 12

export interface MobileInputRef {
  forward: number
  strafe: number
  lookX: number
  lookY: number
}

interface PlayerControllerProps {
  roomWidth: number
  roomLength: number
  roomHeight: number
  partitions?: PartitionWall[]
  enabled?: boolean
  onLockChange?: (locked: boolean) => void
  onPositionChange?: (pos: { x: number; z: number }, rotY: number) => void
  mobileInputRef?: { current: MobileInputRef | null }
}

function collidesWithPartition(
  x: number,
  z: number,
  part: PartitionWall
): boolean {
  const cx = part.position[0]
  const cz = part.position[2]
  const hw = part.width / 2 + COLLISION_MARGIN
  const ht = part.thickness / 2 + COLLISION_MARGIN

  const isHorizontal = Math.abs(part.rotationY) < 0.01
  if (isHorizontal) {
    return (
      x > cx - hw && x < cx + hw &&
      z > cz - ht && z < cz + ht
    )
  }
  return (
    x > cx - ht && x < cx + ht &&
    z > cz - hw && z < cz + hw
  )
}

export default function PlayerController({
  roomWidth,
  roomLength,
  roomHeight,
  partitions = [],
  enabled = true,
  onLockChange,
  onPositionChange,
  mobileInputRef,
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
  const velocity = useRef(new THREE.Vector3())

  useEffect(() => {
    const entranceZ = roomLength / 2 - 1.2
    camera.position.set(0, EYE_HEIGHT, entranceZ)
    yawRef.current = 0
    pitchRef.current = 0
    const euler = new THREE.Euler(0, 0, 0, "YXZ")
    camera.quaternion.setFromEuler(euler)
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

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isLockedRef.current || (isDraggingRef.current && hasEnteredRef.current)) {
        yawRef.current -= e.movementX * MOUSE_SENSITIVITY
        pitchRef.current -= e.movementY * MOUSE_SENSITIVITY
        updateCameraRotation()
      }
    },
    [updateCameraRotation]
  )

  const handleCanvasClick = useCallback(() => {
    if (!hasEnteredRef.current) {
      hasEnteredRef.current = true
      onLockChange?.(true)
    }
    if (!isLockedRef.current) {
      try {
        gl.domElement.requestPointerLock()
      } catch {
        /* fallback drag mode */
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

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false
    }
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

    if (mobileInputRef?.current) {
      const mi = mobileInputRef.current
      yawRef.current -= mi.lookX * MOUSE_SENSITIVITY * 60
      pitchRef.current -= mi.lookY * MOUSE_SENSITIVITY * 60
      mi.lookX = 0
      mi.lookY = 0
      updateCameraRotation()
    }

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
    if (mobileInputRef?.current) {
      const mi = mobileInputRef.current
      if (mi.forward !== 0) movement.current.addScaledVector(forward.current, mi.forward)
      if (mi.strafe !== 0) movement.current.addScaledVector(right.current, mi.strafe)
    }
    if (keys["KeyW"]) movement.current.add(forward.current)
    if (keys["KeyS"]) movement.current.sub(forward.current)
    if (keys["KeyA"]) movement.current.sub(right.current)
    if (keys["KeyD"]) movement.current.add(right.current)

    if (movement.current.lengthSq() > 0) {
      movement.current.normalize()
      velocity.current.lerp(movement.current, Math.min(1, MOVE_SMOOTH * delta))
    } else {
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, MOVE_SMOOTH * delta))
    }

    const prevX = camera.position.x
    const prevZ = camera.position.z
    const step = velocity.current.clone().multiplyScalar(speed * delta)
    if (step.lengthSq() > 1e-6) {
      camera.position.add(step)

      const minX = -roomWidth / 2 + BOUNDS_MARGIN
      const maxX = roomWidth / 2 - BOUNDS_MARGIN
      const minZ = -roomLength / 2 + BOUNDS_MARGIN
      const maxZ = roomLength / 2 - BOUNDS_MARGIN

      camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x))
      camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z))

      for (const part of partitions) {
        if (collidesWithPartition(camera.position.x, camera.position.z, part)) {
          const onlyX = collidesWithPartition(camera.position.x, prevZ, part)
          const onlyZ = collidesWithPartition(prevX, camera.position.z, part)

          if (onlyX && !onlyZ) {
            camera.position.x = prevX
          } else if (!onlyX && onlyZ) {
            camera.position.z = prevZ
          } else {
            camera.position.x = prevX
            camera.position.z = prevZ
          }
        }
      }
    }

    camera.position.y = EYE_HEIGHT

    onPositionChange?.(
      { x: camera.position.x, z: camera.position.z },
      yawRef.current
    )
  })

  return null
}
