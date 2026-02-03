"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/dashboard")
        router.refresh()
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
          <h1 className="text-2xl font-light mb-2">Connexion</h1>
          <p className="text-neutral-500 text-sm mb-8">
            Accédez à votre espace personnel
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-white hover:underline">
                S'inscrire
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
