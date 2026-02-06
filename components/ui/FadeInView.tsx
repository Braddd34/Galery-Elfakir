"use client"

import { useEffect, useRef, useState, ReactNode } from "react"

interface FadeInViewProps {
  children: ReactNode
  className?: string
  delay?: number // délai en ms
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number // durée en ms
  threshold?: number // % visible avant de trigger (0-1)
  once?: boolean // animer une seule fois
}

export default function FadeInView({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
  threshold = 0.1,
  once = true
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, once])

  const getTransform = () => {
    switch (direction) {
      case "up": return "translateY(30px)"
      case "down": return "translateY(-30px)"
      case "left": return "translateX(30px)"
      case "right": return "translateX(-30px)"
      default: return "none"
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0)" : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
