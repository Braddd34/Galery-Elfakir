"use client"

import { useState, useCallback } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginSchema } from "@/lib/validations"
import FormField, { Input } from "@/components/ui/FormField"
import { useLanguage } from "@/components/providers/LanguageProvider"
import Turnstile from "@/components/ui/Turnstile"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const hasTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const onTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])
  const onTurnstileExpire = useCallback(() => {
    setTurnstileToken("")
  }, [])

  // Validation en temps réel
  const validateField = (field: string, value: string) => {
    const data = { email, password, [field]: value }
    const result = loginSchema.safeParse(data)
    
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field)
      setErrors(prev => ({
        ...prev,
        [field]: fieldError?.message || ""
      }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    // Validation complète
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        newErrors[err.path[0] as string] = err.message
      })
      setErrors(newErrors)
      return
    }

    if (hasTurnstile && !turnstileToken) {
      setServerError("Veuillez compléter la vérification de sécurité.")
      return
    }

    setLoading(true)

    try {
      if (hasTurnstile && turnstileToken) {
        const verifyRes = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        })
        if (!verifyRes.ok) {
          setServerError("Vérification de sécurité échouée. Rechargez la page.")
          setLoading(false)
          return
        }
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setServerError(signInResult.error)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setServerError(t("common.error"))
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
          <h1 className="text-2xl font-light mb-2">{t("login.title")}</h1>
          <p className="text-neutral-500 text-sm mb-8">
            {t("login.desc")}
          </p>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-6 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Email" error={errors.email} required>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  validateField("email", e.target.value)
                }}
                onBlur={() => validateField("email", email)}
                error={!!errors.email}
                placeholder={t("login.emailPlaceholder")}
                autoComplete="email"
              />
            </FormField>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500">
                  {t("login.password")} <span className="text-red-400">*</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validateField("password", e.target.value)
                }}
                onBlur={() => validateField("password", password)}
                error={!!errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            <Turnstile onVerify={onTurnstileVerify} onExpire={onTurnstileExpire} />

            <button
              type="submit"
              disabled={loading || (hasTurnstile && !turnstileToken)}
              className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("login.logging") : t("login.submit")}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm">
              {t("login.noAccount")}{" "}
              <Link href="/register" className="text-white hover:underline">
                {t("login.register")}
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-neutral-500 text-sm hover:text-white transition-colors">
            {t("login.backHome")}
          </Link>
        </div>
      </div>
    </main>
  )
}
