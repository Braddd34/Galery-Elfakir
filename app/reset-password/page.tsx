"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { resetPasswordSchema } from "@/lib/validations"
import FormField, { Input } from "@/components/ui/FormField"
import { useLanguage } from "@/components/providers/LanguageProvider"

function ResetPasswordForm() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState("")

  useEffect(() => {
    if (!token) {
      setServerError(t("resetPwd.invalidLink"))
    }
  }, [token])

  const validateField = (field: string, value: string) => {
    const data = { ...formData, [field]: value }
    const result = resetPasswordSchema.safeParse(data)
    
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

  const getPasswordStrength = () => {
    const pwd = formData.password
    if (!pwd) return { level: 0, text: "", color: "" }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    
    if (score <= 1) return { level: 1, text: t("register.strengthWeak"), color: "bg-red-500" }
    if (score === 2) return { level: 2, text: t("register.strengthMedium"), color: "bg-yellow-500" }
    if (score === 3) return { level: 3, text: t("register.strengthStrong"), color: "bg-green-500" }
    return { level: 4, text: t("register.strengthVeryStrong"), color: "bg-green-400" }
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    const result = resetPasswordSchema.safeParse(formData)
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setServerError(data.error || t("common.error"))
      }
    } catch {
      setServerError(t("common.error"))
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
        <h2 className="text-2xl font-light mb-4">{t("resetPwd.invalidLink")}</h2>
        <p className="text-neutral-400 mb-8">
          {t("resetPwd.invalidDesc")}
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-white text-black px-8 py-3 text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
        >
          {t("resetPwd.requestNew")}
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
        <h2 className="text-2xl font-light mb-4">{t("resetPwd.success")}</h2>
        <p className="text-neutral-400 mb-4">
          {t("resetPwd.successDesc")}
        </p>
        <p className="text-neutral-500 text-sm mb-8">
          {t("resetPwd.redirecting")}
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-gold hover:underline"
        >
          {t("resetPwd.loginNow")}
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-light text-center mb-2">{t("resetPwd.title")}</h2>
      <p className="text-neutral-500 text-center mb-8">
        {t("resetPwd.desc")}
      </p>

      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField 
          label={t("resetPwd.title")} 
          error={errors.password} 
          required
          hint={t("resetPwd.hint")}
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

        <FormField label={t("resetPwd.confirm")} error={errors.confirmPassword} required>
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
              {t("resetPwd.resetting")}
            </span>
          ) : (
            t("resetPwd.reset")
          )}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  const { t } = useLanguage()
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
