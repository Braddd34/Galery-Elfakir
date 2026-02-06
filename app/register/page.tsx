"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { registerSchema } from "@/lib/validations"
import FormField, { Input } from "@/components/ui/FormField"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "artist" ? "ARTIST" : "BUYER"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole as "BUYER" | "ARTIST"
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Validation en temps réel
  const validateField = (field: string, value: string) => {
    const data = { ...formData, [field]: value }
    const result = registerSchema.safeParse(data)
    
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field)
      if (fieldError) {
        setErrors(prev => ({ ...prev, [field]: fieldError.message }))
      }
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")
    setSuccess("")

    // Validation complète
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        newErrors[err.path[0] as string] = err.message
      })
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error)
      } else {
        setSuccess(data.message)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch {
      setServerError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  // Indicateur de force du mot de passe
  const getPasswordStrength = () => {
    const pwd = formData.password
    if (!pwd) return { level: 0, text: "", color: "" }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    
    if (score <= 1) return { level: 1, text: "Faible", color: "bg-red-500" }
    if (score === 2) return { level: 2, text: "Moyen", color: "bg-yellow-500" }
    if (score === 3) return { level: 3, text: "Fort", color: "bg-green-500" }
    return { level: 4, text: "Très fort", color: "bg-green-400" }
  }

  const passwordStrength = getPasswordStrength()

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

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-6 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 mb-6 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
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
                  onClick={() => handleChange("role", "BUYER")}
                  className={`py-3 border transition-colors ${
                    formData.role === "BUYER"
                      ? "border-white bg-white text-black"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  Acheteur
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("role", "ARTIST")}
                  className={`py-3 border transition-colors ${
                    formData.role === "ARTIST"
                      ? "border-white bg-white text-black"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  Artiste
                </button>
              </div>
            </div>

            <FormField label="Nom complet" error={errors.name} required>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  handleChange("name", e.target.value)
                  validateField("name", e.target.value)
                }}
                onBlur={() => validateField("name", formData.name)}
                error={!!errors.name}
                placeholder="Votre nom"
                autoComplete="name"
              />
            </FormField>

            <FormField label="Email" error={errors.email} required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  handleChange("email", e.target.value)
                  validateField("email", e.target.value)
                }}
                onBlur={() => validateField("email", formData.email)}
                error={!!errors.email}
                placeholder="votre@email.com"
                autoComplete="email"
              />
            </FormField>

            <FormField 
              label="Mot de passe" 
              error={errors.password} 
              required
              hint="Minimum 8 caractères, 1 majuscule, 1 chiffre"
            >
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  handleChange("password", e.target.value)
                  validateField("password", e.target.value)
                }}
                onBlur={() => validateField("password", formData.password)}
                error={!!errors.password}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.level ? passwordStrength.color : "bg-neutral-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500">{passwordStrength.text}</p>
                </div>
              )}
            </FormField>

            <FormField label="Confirmer le mot de passe" error={errors.confirmPassword} required>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  handleChange("confirmPassword", e.target.value)
                  validateField("confirmPassword", e.target.value)
                }}
                onBlur={() => validateField("confirmPassword", formData.confirmPassword)}
                error={!!errors.confirmPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormField>

            {formData.role === "ARTIST" && (
              <p className="text-neutral-500 text-xs flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Les comptes artistes sont soumis à validation avant activation.
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

// Loading fallback pendant que useSearchParams charge
function RegisterLoading() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <span className="text-2xl tracking-[0.3em] font-light">ELFAKIR</span>
        <p className="text-neutral-500 mt-8">Chargement...</p>
      </div>
    </main>
  )
}

// Page principale avec Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  )
}
