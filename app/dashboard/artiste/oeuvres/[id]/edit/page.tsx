"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUpload from "@/components/ui/ImageUpload"
import { useToast } from "@/lib/toast-context"

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

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "text-neutral-400" },
  PENDING: { label: "En attente de validation", color: "text-yellow-500" },
  AVAILABLE: { label: "Disponible", color: "text-green-500" },
  RESERVED: { label: "Réservée", color: "text-blue-500" },
  SOLD: { label: "Vendue", color: "text-red-500" },
  ARCHIVED: { label: "Archivée", color: "text-neutral-500" }
}

export default function EditArtistArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [images, setImages] = useState<{ url: string; key?: string }[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PAINTING",
    year: new Date().getFullYear().toString(),
    width: "",
    height: "",
    depth: "",
    medium: "",
    price: ""
  })
  const [artworkStatus, setArtworkStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Charger les données de l'œuvre
  useEffect(() => {
    async function loadArtwork() {
      try {
        const res = await fetch(`/api/artist/artworks/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Erreur lors du chargement")
        }

        const artwork = data.artwork
        
        // Parser les images
        let parsedImages: { url: string; key?: string }[] = []
        try {
          const imgData = typeof artwork.images === "string" 
            ? JSON.parse(artwork.images) 
            : artwork.images
          parsedImages = imgData.map((img: any) => ({ url: img.url, key: img.key }))
        } catch {
          parsedImages = []
        }

        setImages(parsedImages)
        setArtworkStatus(artwork.status)
        setFormData({
          title: artwork.title,
          description: artwork.description,
          category: artwork.category,
          year: artwork.year.toString(),
          width: artwork.width.toString(),
          height: artwork.height.toString(),
          depth: artwork.depth?.toString() || "",
          medium: artwork.medium,
          price: artwork.price.toString()
        })
      } catch (err: any) {
        setError(err.message)
        showToast(err.message, "error")
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === "ARTIST") {
      loadArtwork()
    }
  }, [id, session, showToast])

  // Rediriger si pas connecté ou pas artiste
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
          <p className="text-neutral-400">Chargement de l'œuvre...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "ARTIST") {
    router.push("/dashboard")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (images.length === 0) {
      setError("Veuillez ajouter au moins une image")
      return
    }

    if (!formData.title || !formData.description || !formData.price) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/artist/artworks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: images
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la modification")
      }

      showToast(data.message || "Œuvre mise à jour", "success")
      router.push("/dashboard/artiste/oeuvres")
    } catch (err: any) {
      setError(err.message)
      showToast(err.message, "error")
    } finally {
      setSaving(false)
    }
  }

  const isSold = artworkStatus === "SOLD"

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <Link 
            href="/dashboard/artiste/oeuvres"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Retour à mes œuvres
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light mb-2">Modifier l'œuvre</h1>
            <p className="text-neutral-500">
              Modifiez les informations de votre œuvre.
            </p>
          </div>
          {/* Status Badge */}
          <div className={`px-4 py-2 border border-neutral-700 text-sm ${statusLabels[artworkStatus]?.color || ""}`}>
            {statusLabels[artworkStatus]?.label || artworkStatus}
          </div>
        </div>

        {isSold && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 text-red-400">
            Cette œuvre a été vendue et ne peut plus être modifiée.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images */}
          <div>
            <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-4">
              Images *
            </label>
            <ImageUpload 
              images={images}
              onChange={setImages}
              maxImages={5}
              disabled={isSold}
            />
            <p className="text-neutral-500 text-sm mt-2">
              Ajoutez jusqu'à 5 images. La première sera l'image principale.
            </p>
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
              disabled={isSold}
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Titre de l'œuvre"
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
              disabled={isSold}
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Décrivez votre œuvre, son histoire, votre inspiration..."
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
                disabled={isSold}
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                Année de création *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={isSold}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-2">
              Dimensions (cm) *
            </label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                required
                disabled={isSold}
                placeholder="Largeur"
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                disabled={isSold}
                placeholder="Hauteur"
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="number"
                name="depth"
                value={formData.depth}
                onChange={handleChange}
                disabled={isSold}
                placeholder="Profondeur (optionnel)"
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Medium */}
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
              disabled={isSold}
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Ex: Huile sur toile, Bronze, Photographie argentique..."
            />
          </div>

          {/* Price */}
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
              disabled={isSold}
              min="0"
              step="0.01"
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Prix de vente"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-900 text-red-400 px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          {!isSold && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-white text-black py-4 text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
              <Link
                href="/dashboard/artiste/oeuvres"
                className="px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors flex items-center"
              >
                Annuler
              </Link>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
