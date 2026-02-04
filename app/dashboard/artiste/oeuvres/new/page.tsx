"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

export default function NewArtistArtworkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Rediriger si pas connecté ou pas artiste
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Chargement...</p>
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

    setLoading(true)

    try {
      const res = await fetch("/api/artist/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: images
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la création")
      }

      router.push("/dashboard/artiste/oeuvres")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-3xl font-light mb-2">Ajouter une œuvre</h1>
        <p className="text-neutral-500 mb-8">
          Votre œuvre sera soumise à validation avant d'être publiée sur le catalogue.
        </p>

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
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
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
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none resize-none"
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
                Année de création *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear()}
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
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
                placeholder="Largeur"
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
              />
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                placeholder="Hauteur"
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
              />
              <input
                type="number"
                name="depth"
                value={formData.depth}
                onChange={handleChange}
                placeholder="Profondeur (optionnel)"
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
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
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
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
              min="0"
              step="0.01"
              className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
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
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black py-4 text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "Soumettre l'œuvre"}
            </button>
            <Link
              href="/dashboard/artiste/oeuvres"
              className="px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
