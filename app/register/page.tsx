"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "artist" ? "ARTIST" : "BUYER"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"BUYER" | "ARTIST">(defaultRole)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        setSuccess(data.message)
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-12">
          <span className="text-2xl tracking-[0.3em] font-light">ELFAKIR</span>
        </Link>

        {/* Form Card */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 md:p-12">
          <h1 className="text-2xl font-light mb-2">Créer un compte</h1>
          <p className="text-neutral-500 text-sm mb-8">
            Rejoignez notre communauté
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-3">
                Je suis
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={`py-3 border transition-colors ${
                    role === "BUYER"
                      ? "border-white bg-white text-black"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  Acheteur
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ARTIST")}
                  className={`py-3 border transition-colors ${
                    role === "ARTIST"
                      ? "border-white bg-white text-black"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  Artiste
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="Minimum 8 caractères"
              />
            </div>

            {role === "ARTIST" && (
              <p className="text-neutral-500 text-xs">
                ⓘ Les comptes artistes sont soumis à validation avant activation.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-white hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-neutral-500 text-sm hover:text-white transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
