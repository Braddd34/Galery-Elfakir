"use client"

import { useState, useEffect } from "react"

const COOKIE_KEY = "cookie_consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted")
    setVisible(false)
  }

  const refuse = () => {
    localStorage.setItem(COOKIE_KEY, "refused")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6">
      <div className="mx-auto max-w-xl bg-neutral-900 border border-neutral-700 p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-neutral-300 flex-1">
          Ce site utilise des cookies essentiels au fonctionnement (authentification, session).
          Aucun cookie publicitaire n&apos;est utilisé.{" "}
          <a href="/politique-confidentialite" className="underline text-white hover:text-neutral-400 transition-colors">
            En savoir plus
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 text-sm border border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
