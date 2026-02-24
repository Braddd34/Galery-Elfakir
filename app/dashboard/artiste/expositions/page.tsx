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
        <VirtualExhibitionProposal />
      </div>
    </main>
  )
}

function VirtualExhibitionProposal() {
  const { showToast } = useToast()
  const [showVirtual, setShowVirtual] = useState(false)
  const [artworks, setArtworks] = useState<Array<{ id: string; title: string; images: unknown }>>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [virtTitle, setVirtTitle] = useState("")
  const [virtDesc, setVirtDesc] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [proposals, setProposals] = useState<Array<{ id: string; title: string; status: string; createdAt: string }>>([])

  useEffect(() => {
    if (!showVirtual) return
    fetch("/api/artist/artworks")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.artworks || []
        setArtworks(list)
      })
      .catch(() => {})

    fetch("/api/virtual-exhibitions?mine=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.exhibitions) setProposals(data.exhibitions)
      })
      .catch(() => {})
  }, [showVirtual])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmitProposal = async () => {
    if (!virtTitle.trim() || selectedIds.length === 0) {
      showToast("Veuillez remplir le titre et sélectionner au moins une œuvre", "error")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/virtual-exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: virtTitle,
          description: virtDesc,
          theme: "white",
          artworkIds: selectedIds,
        }),
      })
      if (res.ok) {
        showToast("Proposition envoyée ! Un administrateur la validera.", "success")
        setVirtTitle("")
        setVirtDesc("")
        setSelectedIds([])
        const data = await res.json()
        setProposals((prev) => [data, ...prev])
      } else {
        showToast("Erreur lors de la soumission", "error")
      }
    } catch {
      showToast("Erreur réseau", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-16 pt-12 border-t border-neutral-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-light">Expositions Virtuelles 3D</h2>
          <p className="text-neutral-500 mt-1 text-sm">
            Proposez une exposition virtuelle avec vos œuvres. Un administrateur la validera et la mettra en ligne.
          </p>
        </div>
        <button
          onClick={() => setShowVirtual(!showVirtual)}
          className="px-6 py-3 bg-amber-600 text-black text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
        >
          {showVirtual ? "Masquer" : "Proposer une expo"}
        </button>
      </div>

      {proposals.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">Mes propositions</h3>
          {proposals.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-6 py-4">
              <div>
                <span className="text-white">{p.title}</span>
                <span className="text-neutral-600 text-sm ml-3">
                  {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <span className={`text-xs uppercase tracking-wider px-3 py-1 rounded ${
                p.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" :
                p.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                p.status === "DRAFT" ? "bg-neutral-700 text-neutral-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {p.status === "PUBLISHED" ? "Publiée" :
                 p.status === "PENDING" ? "En attente" :
                 p.status === "DRAFT" ? "Brouillon" : "Archivée"}
              </span>
            </div>
          ))}
        </div>
      )}

      {showVirtual && (
        <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Titre de l&apos;exposition</label>
            <input
              type="text"
              value={virtTitle}
              onChange={(e) => setVirtTitle(e.target.value)}
              className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
              placeholder="Ex: Paysages abstraits"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Description (optionnel)</label>
            <textarea
              value={virtDesc}
              onChange={(e) => setVirtDesc(e.target.value)}
              rows={3}
              className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none resize-none"
              placeholder="Décrivez votre exposition..."
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-4">
              Sélectionnez vos œuvres ({selectedIds.length} sélectionnée{selectedIds.length > 1 ? "s" : ""})
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto">
              {artworks.map((aw) => {
                const imgs = typeof aw.images === "string" ? JSON.parse(aw.images) : aw.images
                const imgUrl = Array.isArray(imgs) ? imgs[0]?.url : ""
                const selected = selectedIds.includes(aw.id)
                return (
                  <button
                    key={aw.id}
                    type="button"
                    onClick={() => toggleSelect(aw.id)}
                    className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                      selected ? "border-amber-500" : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {imgUrl && (
                      <img src={imgUrl} alt={aw.title} className="w-full h-full object-cover" />
                    )}
                    {!imgUrl && (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                        {aw.title}
                      </div>
                    )}
                    {selected && (
                      <div className="absolute top-1 right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmitProposal}
            disabled={submitting || !virtTitle.trim() || selectedIds.length === 0}
            className="w-full py-4 bg-amber-600 text-black font-medium uppercase tracking-wider hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Envoi en cours..." : "Soumettre la proposition"}
          </button>
        </div>
      )}
    </div>
  )
}
