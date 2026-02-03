"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Artist {
  id: string
  user: {
    name: string
  }
}

export default function NewArtworkPage() {
  const router = useRouter()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PAINTING",
    year: new Date().getFullYear(),
    width: "",
    height: "",
    depth: "",
    medium: "",
    support: "",
    price: "",
    artistId: "",
    status: "DRAFT",
    imageUrl: "",
  })

  useEffect(() => {
    // Charger la liste des artistes
    fetch("/api/admin/artists")
      .then(res => res.json())
      .then(data => setArtists(data.artists || []))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
      } else {
        router.push("/admin/oeuvres")
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: "PAINTING", label: "Peinture" },
    { value: "SCULPTURE", label: "Sculpture" },
    { value: "PHOTOGRAPHY", label: "Photographie" },
    { value: "DRAWING", label: "Dessin" },
    { value: "PRINT", label: "Estampe" },
    { value: "DIGITAL", label: "Art numérique" },
    { value: "MIXED_MEDIA", label: "Technique mixte" },
    { value: "OTHER", label: "Autre" },
  ]

  const statuses = [
    { value: "DRAFT", label: "Brouillon" },
    { value: "PENDING", label: "En attente de validation" },
    { value: "AVAILABLE", label: "Disponible à la vente" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
            <Link href="/admin/oeuvres" className="hover:text-white transition-colors">
              Œuvres
            </Link>
            <span>/</span>
            <span>Nouvelle œuvre</span>
          </div>
          <h1 className="text-3xl font-light">Ajouter une œuvre</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h2 className="text-lg font-light mb-6">Informations générales</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Titre de l'œuvre"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                    placeholder="Description détaillée de l'œuvre..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      Année *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                      min={1900}
                      max={new Date().getFullYear()}
                      className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h2 className="text-lg font-light mb-6">Caractéristiques</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Largeur (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    required
                    step="0.1"
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Hauteur (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    required
                    step="0.1"
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Profondeur (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.depth}
                    onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                    step="0.1"
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Technique / Médium *
                  </label>
                  <input
                    type="text"
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    required
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Ex: Huile sur toile"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Support
                  </label>
                  <input
                    type="text"
                    value={formData.support}
                    onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Ex: Toile de lin"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h2 className="text-lg font-light mb-6">Image</h2>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                  URL de l'image *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="https://..."
                />
                <p className="text-neutral-600 text-xs mt-2">
                  Utilisez une URL d'image (Unsplash, etc.) pour le moment.
                  L'upload direct sera ajouté prochainement.
                </p>
              </div>

              {formData.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={formData.imageUrl} 
                    alt="Aperçu" 
                    className="max-h-48 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h2 className="text-lg font-light mb-6">Publication</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Artiste *
                  </label>
                  <select
                    value={formData.artistId}
                    onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                    required
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="">Sélectionner un artiste</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min={0}
                    step="0.01"
                    className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer l'œuvre"}
              </button>
              
              <Link
                href="/admin/oeuvres"
                className="block w-full text-center border border-neutral-700 py-4 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
