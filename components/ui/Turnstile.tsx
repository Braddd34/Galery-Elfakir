"use client"

import { useEffect, useRef, useCallback } from "react"

interface TurnstileProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim()

export default function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)

  const renderWidget = useCallback(() => {
    if (!mountedRef.current) return
    if (!containerRef.current || !window.turnstile || !SITE_KEY) return
    if (widgetIdRef.current) return

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token: string) => {
          if (mountedRef.current) onVerify(token)
        },
        "expired-callback": () => {
          if (mountedRef.current) onExpire?.()
        },
        "error-callback": () => {
          console.warn("Turnstile: widget error")
        },
      })
    } catch {
      console.warn("Turnstile: render failed")
    }
  }, [onVerify, onExpire])

  useEffect(() => {
    mountedRef.current = true
    if (!SITE_KEY) return

    if (window.turnstile) {
      renderWidget()
      return
    }

    const scriptId = "cf-turnstile-script"
    const existing = document.getElementById(scriptId)

    if (existing) {
      window.onTurnstileLoad = renderWidget
      if (window.turnstile) renderWidget()
      return
    }

    window.onTurnstileLoad = renderWidget

    const script = document.createElement("script")
    script.id = scriptId
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit"
    script.async = true
    document.head.appendChild(script)

    return () => {
      mountedRef.current = false
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch { /* ignore */ }
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  if (!SITE_KEY) return null

  return <div ref={containerRef} className="my-4" />
}
