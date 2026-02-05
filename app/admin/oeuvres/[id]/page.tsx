"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/lib/toast-context"
import ImageUpload from "@/components/ui/ImageUpload"

const categories = [
  { value: "PAINTING", label: "Peinture" },
  { value: "SCULPTURE", label: "Sculpture" },
  { value: "PHOTOGRAPHY", label: "Photographie" },
  { value: "DRAWING", label: "Dessin" },
  { value: "PRINT", label: "Estampe" },
  { value: "DIGITAL", label: "Art numérique" },
  { value: "MIXED_MEDIA", label: "Technique mixte" },
  { value: "OTHER", label: "Autre" }
]

const statuses = [
  { value: "DRAFT", label: "Brouillon", color: "bg-neutral-500" },
  { value: "PENDING", label: "En attente", color: "bg-yellow-500" },
  { value: "AVAILABLE", label: "Disponible", color: "bg-green-500" },
  { value: "RESERVED", label: "Réservé", color: "bg-blue-500" },
  { value: "SOLD", label: "Vendu", color: "bg-purple-500" },
  { value: "ARCHIVED", label: "Archivé", color: "bg-neutral-700" }
]

export default function EditArtworkPage({ params }: { params: { id: string } }) {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<{ url: string; key?: string }[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PAINTING",
    status: "AVAILABLE",
    year: new Date().getFullYear().toString(),
    width: "",
    height: "",
    depth: "",
    medium: "",
    price: ""
  })

  // Charger l'œuvre
  useEffect(() => {
    if (sessionStatus === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    async function fetchArtwork() {
      try {
        const res = await fetch(`/api/admin/artworks/${params.id}`)
        if (!res.ok) throw new Error("Œuvre non trouvée")
        
        const data = await res.json()
        const artwork = data.artwork
        
        setFormData({
          title: artwork.title || "",
          description: artwork.description || "",
          category: artwork.category || "PAINTING",
          status: artwork.status || "AVAILABLE",
          year: artwork.year?.toString() || "",
          width: artwork.width?.toString() || "",
          height: artwork.height?.toString() || "",
          depth: artwork.depth?.toString() || "",
          medium: artwork.medium || "",
          price: artwork.price?.toString() || ""
        })
        
        // Parser les images
        try {
          const imgs = typeof artwork.images === 'string' 
            ? JSON.parse(artwork.images) 
            : artwork.images
          setImages(imgs || [])
        } catch {
          setImages([])
        }
      } catch (error) {
        showToast("Erreur lors du chargement", "error")
        router.push("/admin/oeuvres")
      } finally {
        setLoading(false)
      }
    }

    fetchArtwork()
  }, [session, sessionStatus, params.id, router, showToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/artworks/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la sauvegarde")
      }

      showToast("Œuvre mise à jour avec succès", "success")
      router.push("/admin/oeuvres")
    } catch (err: any) {
      showToast(err.message, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light">Modifier l'œuvre</h1>
          <p className="text-neutral-500 mt-1">ID: {params.id}</p>
        </div>
        <Link
          href="/admin/oeuvres"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          ← Retour à la liste
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Statut */}
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-4">
            Statut de l'œuvre
          </label>
          <div className="flex flex-wrap gap-3">
            {statuses.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFormData({ ...formData, status: s.value })}
                className={`px-4 py-2 text-sm border transition-colors ${
                  formData.status === s.value
                    ? "border-white bg-white text-black"
                    : "border-neutral-700 hover:border-neutral-500"
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.color}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-4">
            Images
          </label>
          <ImageUpload 
            images={images}
            onChange={setImages}
            maxImages={5}
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
            Titre *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none resize-none"
          />
        </div>

        {/* Category & Year */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
              Année *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
            Dimensions (cm)
          </label>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              placeholder="Largeur"
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
            />
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="Hauteur"
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
            />
            <input
              type="number"
              name="depth"
              value={formData.depth}
              onChange={handleChange}
              placeholder="Profondeur"
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Medium & Price */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
              Technique / Medium *
            </label>
            <input
              type="text"
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
              Prix (€) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-white text-black py-4 text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <Link
            href="/admin/oeuvres"
            className="px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors text-center"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
