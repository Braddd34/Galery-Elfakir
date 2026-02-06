"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error")
        setMessage("Lien de vérification invalide")
        return
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "Une erreur est survenue")
        }
      } catch {
        setStatus("error")
        setMessage("Une erreur est survenue lors de la vérification")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <>
      {status === "loading" && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-2xl font-light mb-4">Vérification en cours...</h2>
          <p className="text-neutral-400">Veuillez patienter</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-light mb-4">Email vérifié !</h2>
          <p className="text-neutral-400 mb-8">{message}</p>
          <Link
            href="/login"
            className="inline-block bg-white text-black px-8 py-3 text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-light mb-4">Erreur de vérification</h2>
          <p className="text-neutral-400 mb-8">{message}</p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="inline-block bg-white text-black px-8 py-3 text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
            >
              Se connecter
            </Link>
            <p className="text-neutral-500 text-sm">
              Besoin d'aide ?{" "}
              <Link href="/contact" className="text-white hover:underline">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-12">
          <h1 className="text-2xl tracking-[0.3em] font-light">ELFAKIR</h1>
        </Link>

        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  )
}
