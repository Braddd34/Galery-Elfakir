"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || "Une erreur est survenue")
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-12">
          <h1 className="text-2xl tracking-[0.3em] font-light">ELFAKIR</h1>
        </Link>

        {sent ? (
          // Message de succès
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-light mb-4">Email envoyé</h2>
            <p className="text-neutral-400 mb-8">
              Si un compte existe avec l'adresse <span className="text-white">{email}</span>, 
              vous recevrez un lien de réinitialisation dans quelques instants.
            </p>
            <p className="text-neutral-500 text-sm mb-8">
              Pensez à vérifier vos spams si vous ne trouvez pas l'email.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm text-neutral-400 hover:text-white transition-colors"
            >
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          // Formulaire
          <>
            <h2 className="text-2xl font-light text-center mb-2">Mot de passe oublié ?</h2>
            <p className="text-neutral-500 text-center mb-8">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
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
                    Envoi en cours...
                  </span>
                ) : (
                  "Envoyer le lien"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
