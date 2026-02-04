"use client"

import { useState } from "react"
import { useToast } from "@/lib/toast-context"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || "Merci pour votre inscription !", "success")
        setEmail("")
      } else {
        showToast(data.error || "Une erreur est survenue", "error")
      }
    } catch {
      showToast("Une erreur est survenue", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        required
        className="flex-1 bg-transparent border border-neutral-700 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "S'inscrire"}
      </button>
    </form>
  )
}
