"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/lib/toast-context"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface Exhibition {
  id: string
  title: string
  description: string | null
  location: string
  city: string | null
  country: string | null
  startDate: string
  endDate: string | null
  imageUrl: string | null
  link: string | null
}

/**
 * Page de gestion des expositions pour les artistes.
 * Permet d'ajouter, voir et supprimer ses expositions passées et actuelles.
 */
export default function ExpositionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    city: "",
    country: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
    link: ""
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ARTIST") {
      router.push("/dashboard")
      return
    }
    fetchExhibitions()
  }, [session, status, router])

  const fetchExhibitions = async () => {
    try {
      const res = await fetch("/api/artist/exhibitions")
      if (res.ok) {
        const data = await res.json()
        setExhibitions(data)
      }
    } catch (error) {
      console.error("Erreur chargement expositions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/artist/exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        const newExhibition = await res.json()
        setExhibitions([newExhibition, ...exhibitions])
        setShowForm(false)
        setForm({ title: "", description: "", location: "", city: "", country: "", startDate: "", endDate: "", imageUrl: "", link: "" })
        showToast(t("exhibitions.addedSuccess"), "success")
      } else {
        const data = await res.json()
        showToast(data.error || "Erreur lors de l'ajout", "error")
      }
    } catch {
      showToast("Erreur réseau", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette exposition ?")) return

    try {
      const res = await fetch(`/api/artist/exhibitions?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setExhibitions(exhibitions.filter(e => e.id !== id))
        showToast(t("exhibitions.deletedSuccess"), "info")
      } else {
        showToast("Erreur lors de la suppression", "error")
      }
    } catch {
      showToast("Erreur réseau", "error")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
            <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">← Retour</Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-neutral-900" />)}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">{t("exhibitions.backToDashboard")}</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light">{t("exhibitions.title")}</h1>
            <p className="text-neutral-500 mt-1">{t("exhibitions.manage")}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-white text-black text-sm uppercase tracking-wider hover:bg-gold transition-colors"
          >
            {showForm ? t("exhibitions.cancel") : `+ ${t("exhibitions.add")}`}
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 mb-8 space-y-6">
            <h2 className="text-lg font-light mb-4">{t("exhibitions.new")}</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.titleLabel")}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  placeholder={t("exhibitions.titlePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.locationLabel")}</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  placeholder={t("exhibitions.locationPlaceholder")}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.cityLabel")}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  placeholder={t("exhibitions.cityPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.countryLabel")}</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  placeholder={t("exhibitions.countryPlaceholder")}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.startDateLabel")}</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.endDateLabel")}</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.descriptionLabel")}</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none resize-none"
                placeholder={t("exhibitions.descriptionPlaceholder")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.imageUrlLabel")}</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">{t("exhibitions.linkLabel")}</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-white text-black text-sm uppercase tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
            >
              {saving ? t("exhibitions.saving") : t("exhibitions.addExhibition")}
            </button>
          </form>
        )}

        {/* Liste des expositions */}
        {exhibitions.length > 0 ? (
          <div className="space-y-4">
            {exhibitions.map(expo => (
              <div key={expo.id} className="bg-neutral-900 border border-neutral-800 p-6 flex gap-6">
                {expo.imageUrl && (
                  <img src={expo.imageUrl} alt={expo.title} className="w-32 h-24 object-cover bg-neutral-800 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-light">{expo.title}</h3>
                  <p className="text-neutral-500 text-sm mt-1">
                    {expo.location}
                    {expo.city && `, ${expo.city}`}
                    {expo.country && ` (${expo.country})`}
                  </p>
                  <p className="text-neutral-600 text-sm mt-1">
                    {new Date(expo.startDate).toLocaleDateString("fr-FR")}
                    {expo.endDate && ` — ${new Date(expo.endDate).toLocaleDateString("fr-FR")}`}
                  </p>
                  {expo.description && (
                    <p className="text-neutral-400 text-sm mt-2 line-clamp-2">{expo.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {expo.link && (
                    <a href={expo.link} target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:underline">
                      {t("exhibitions.view")}
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(expo.id)}
                    className="text-red-500 text-sm hover:text-red-400"
                  >
                    {t("exhibitions.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-neutral-800">
            <p className="text-neutral-500 mb-2">{t("exhibitions.none")}</p>
            <p className="text-neutral-600 text-sm">{t("exhibitions.emptyDesc")}</p>
          </div>
        )}
      </div>
    </main>
  )
}
