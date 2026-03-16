"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { contactSchema } from "@/lib/validations"
import FormField, { Input, Textarea, Select } from "@/components/ui/FormField"
import { useLanguage } from "@/components/providers/LanguageProvider"

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [serverError, setServerError] = useState("")

  const validateField = (field: string, value: string) => {
    const data = { ...formData, [field]: value }
    const result = contactSchema.safeParse(data)
    
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

    // Validation complète
    const result = contactSchema.safeParse(formData)
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setFormData({ name: "", email: "", subject: "", message: "" })
        setErrors({})
      } else {
        setStatus("error")
        setServerError(data.error || t("common.error"))
      }
    } catch {
      setStatus("error")
      setServerError(t("common.error"))
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              {t("contact.title")}
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl">
              {t("contact.desc")}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Form */}
              <div>
                <h2 className="text-2xl font-light mb-8">
                  {t("contact.sendMessage")}
                </h2>

                {status === "success" ? (
                  <div className="bg-green-500/10 border border-green-500/50 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-400 text-lg">
                      {t("contact.successTitle")}
                    </p>
                    <p className="text-neutral-500 text-sm mt-2">
                      {t("contact.successDesc")}
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-6 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {t("contact.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {serverError && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {serverError}
                      </div>
                    )}

                    <FormField label={t("contact.fullName")} error={errors.name} required>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          handleChange("name", e.target.value)
                          validateField("name", e.target.value)
                        }}
                        onBlur={() => validateField("name", formData.name)}
                        error={!!errors.name}
                        placeholder={t("contact.fullNamePlaceholder")}
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
                      />
                    </FormField>

                    <FormField label={t("contact.subject")} error={errors.subject} required>
                      <Select
                        value={formData.subject}
                        onChange={(e) => {
                          handleChange("subject", e.target.value)
                          validateField("subject", e.target.value)
                        }}
                        error={!!errors.subject}
                      >
                        <option value="">{t("contact.selectSubject")}</option>
                        <option value="Question sur une œuvre">{t("contact.subjectArtwork")}</option>
                        <option value="Question sur une commande">{t("contact.subjectOrder")}</option>
                        <option value="Devenir artiste">{t("contact.subjectArtist")}</option>
                        <option value="Partenariat">{t("contact.subjectPartnership")}</option>
                        <option value="Autre">{t("contact.subjectOther")}</option>
                      </Select>
                    </FormField>

                    <FormField 
                      label="Message" 
                      error={errors.message} 
                      required
                      hint={t("contact.minChars")}
                    >
                      <Textarea
                        value={formData.message}
                        onChange={(e) => {
                          handleChange("message", e.target.value)
                          validateField("message", e.target.value)
                        }}
                        onBlur={() => validateField("message", formData.message)}
                        error={!!errors.message}
                        rows={6}
                        placeholder={t("contact.messagePlaceholder")}
                      />
                      {formData.message && (
                        <p className="text-neutral-600 text-xs mt-1">
                          {formData.message.length}/2000 {t("contact.characters")}
                        </p>
                      )}
                    </FormField>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t("contact.sending")}
                        </span>
                      ) : t("contact.send")}
                    </button>
                  </form>
                )}
              </div>

              {/* Info */}
              <div className="lg:pl-16">
                <h2 className="text-2xl font-light mb-8">
                  {t("contact.info")}
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      {t("contact.email")}
                    </h3>
                    <a 
                      href="mailto:contact@elfakir.art" 
                      className="text-white hover:text-neutral-300 transition-colors"
                    >
                      contact@elfakir.art
                    </a>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      {t("contact.hours")}
                    </h3>
                    <p className="text-neutral-400">
                      {t("contact.hoursMF")}<br />
                      {t("contact.hoursSat")}<br />
                      {t("contact.hoursSun")}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-neutral-800">
                    <p className="text-neutral-500 text-sm">
                      {t("contact.responseTime")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
