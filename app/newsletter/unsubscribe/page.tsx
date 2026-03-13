"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const token = searchParams.get("token") || ""
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!email || !token) {
      setStatus("error")
      setMessage("Lien de désinscription invalide.")
      return
    }

    fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token })
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage("Vous avez été désinscrit de notre newsletter.")
        } else {
          setStatus("error")
          setMessage(data.error || "Une erreur est survenue.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Erreur de connexion.")
      })
  }, [email, token])

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        <h1 className="text-2xl font-light mb-6 tracking-[0.3em]">ELFAKIR</h1>

        {status === "loading" && (
          <p className="text-neutral-400">Désinscription en cours...</p>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-neutral-300">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-neutral-300">{message}</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 border border-neutral-700 text-sm hover:border-white transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  )
}
