"use client"

import { useState, useRef, useCallback } from "react"

interface MobileControlsProps {
  onMove: (forward: number, strafe: number) => void
  onLook: (deltaX: number, deltaY: number) => void
  visible: boolean
}

const JOYSTICK_SIZE = 100
const JOYSTICK_KNOB_SIZE = 40
const JOYSTICK_MAX_OFFSET = (JOYSTICK_SIZE - JOYSTICK_KNOB_SIZE) / 2

export default function MobileControls({
  onMove,
  onLook,
  visible,
}: MobileControlsProps) {
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 })
  const joystickStartRef = useRef<{ x: number; y: number } | null>(null)
  const joystickTouchIdRef = useRef<number | null>(null)
  const lookLastRef = useRef<{ x: number; y: number } | null>(null)
  const lookTouchIdRef = useRef<number | null>(null)

  const handleJoystickTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (joystickTouchIdRef.current !== null) return
      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      joystickStartRef.current = { x: centerX, y: centerY }
      joystickTouchIdRef.current = touch.identifier
    },
    []
  )

  const handleJoystickTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (joystickTouchIdRef.current === null) return
      const touch = Array.from(e.touches).find(
        (t) => t.identifier === joystickTouchIdRef.current
      )
      if (!touch || !joystickStartRef.current) return
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      let dx = touch.clientX - centerX
      let dy = touch.clientY - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > JOYSTICK_MAX_OFFSET) {
        const scale = JOYSTICK_MAX_OFFSET / dist
        dx *= scale
        dy *= scale
      }
      setJoystickOffset({ x: dx, y: dy })
      const forward = Math.max(-1, Math.min(1, -dy / JOYSTICK_MAX_OFFSET))
      const strafe = Math.max(-1, Math.min(1, dx / JOYSTICK_MAX_OFFSET))
      onMove(forward, strafe)
    },
    [onMove]
  )

  const handleJoystickTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (
        joystickTouchIdRef.current !== null &&
        !Array.from(e.touches).some(
          (t) => t.identifier === joystickTouchIdRef.current
        )
      ) {
        joystickTouchIdRef.current = null
        joystickStartRef.current = null
        setJoystickOffset({ x: 0, y: 0 })
        onMove(0, 0)
      }
    },
    [onMove]
  )

  const handleLookTouchStart = useCallback((e: React.TouchEvent) => {
    if (lookTouchIdRef.current !== null) return
    const touch = e.touches[0]
    lookLastRef.current = { x: touch.clientX, y: touch.clientY }
    lookTouchIdRef.current = touch.identifier
  }, [])

  const handleLookTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (lookTouchIdRef.current === null) return
      const touch = Array.from(e.touches).find(
        (t) => t.identifier === lookTouchIdRef.current
      )
      if (!touch || !lookLastRef.current) return
      const deltaX = touch.clientX - lookLastRef.current.x
      const deltaY = touch.clientY - lookLastRef.current.y
      lookLastRef.current = { x: touch.clientX, y: touch.clientY }
      onLook(deltaX, deltaY)
    },
    [onLook]
  )

  const handleLookTouchEnd = useCallback((e: React.TouchEvent) => {
    if (
      lookTouchIdRef.current !== null &&
      !Array.from(e.touches).some(
        (t) => t.identifier === lookTouchIdRef.current
      )
    ) {
      lookTouchIdRef.current = null
      lookLastRef.current = null
    }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
          touchAction: "none",
        }}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
      >
        <div
          style={{
            width: JOYSTICK_KNOB_SIZE,
            height: JOYSTICK_KNOB_SIZE,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          pointerEvents: "auto",
          touchAction: "none",
        }}
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
      />
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          <path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </div>
    </div>
  )
}
