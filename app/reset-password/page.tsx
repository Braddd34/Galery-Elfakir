"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("Lien de réinitialisation invalide")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.error || "Une erreur est survenue")
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-light mb-4">Lien invalide</h2>
        <p className="text-neutral-400 mb-8">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-white text-black px-8 py-3 text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-light mb-4">Mot de passe réinitialisé</h2>
        <p className="text-neutral-400 mb-4">
          Votre mot de passe a été modifié avec succès.
        </p>
        <p className="text-neutral-500 text-sm mb-8">
          Redirection vers la page de connexion...
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-gold hover:underline"
        >
          Se connecter maintenant
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-light text-center mb-2">Nouveau mot de passe</h2>
      <p className="text-neutral-500 text-center mb-8">
        Choisissez un nouveau mot de passe sécurisé
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-white focus:outline-none transition-colors"
          />
          <p className="text-neutral-600 text-xs mt-2">
            Minimum 8 caractères
          </p>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-4 text-sm tracking-[0.15em] uppercase font-medium hover:bg-neutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Réinitialisation...
            </span>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
