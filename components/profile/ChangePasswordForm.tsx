"use client"

import { useState } from "react"
import { changePasswordSchema } from "@/lib/validations"
import FormField, { Input } from "@/components/ui/FormField"

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [serverError, setServerError] = useState("")

  const validateField = (field: string, value: string) => {
    const data = { ...formData, [field]: value }
    const result = changePasswordSchema.safeParse(data)
    
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

  // Indicateur de force du mot de passe
  const getPasswordStrength = () => {
    const pwd = formData.newPassword
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    // Validation complète
    const result = changePasswordSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        newErrors[err.path[0] as string] = err.message
      })
      setErrors(newErrors)
      return
    }

    setStatus("loading")

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setErrors({})
        // Fermer le formulaire après 2 secondes
        setTimeout(() => {
          setIsOpen(false)
          setStatus("idle")
        }, 2000)
      } else {
        setStatus("error")
        setServerError(data.error || "Une erreur est survenue")
      }
    } catch {
      setStatus("error")
      setServerError("Une erreur est survenue")
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">Mot de passe</h3>
            <p className="text-neutral-500 text-sm">••••••••</p>
          </div>
          <span className="text-neutral-500 text-sm">Modifier</span>
        </div>
      </button>
    )
  }

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-light">Changer le mot de passe</h3>
        <button
          onClick={() => {
            setIsOpen(false)
            setStatus("idle")
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            setErrors({})
          }}
          className="text-neutral-500 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {status === "success" ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-400">Mot de passe modifié avec succès</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}

          <FormField label="Mot de passe actuel" error={errors.currentPassword} required>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => {
                handleChange("currentPassword", e.target.value)
                validateField("currentPassword", e.target.value)
              }}
              error={!!errors.currentPassword}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </FormField>

          <FormField 
            label="Nouveau mot de passe" 
            error={errors.newPassword} 
            required
            hint="Minimum 8 caractères, 1 majuscule, 1 chiffre"
          >
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => {
                handleChange("newPassword", e.target.value)
                validateField("newPassword", e.target.value)
              }}
              error={!!errors.newPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {formData.newPassword && (
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
              error={!!errors.confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </FormField>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-white text-black py-3 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Modification...
              </span>
            ) : "Changer le mot de passe"}
          </button>
        </form>
      )}
    </div>
  )
}
