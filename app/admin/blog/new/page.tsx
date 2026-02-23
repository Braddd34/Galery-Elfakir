"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminBlogNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    published: false,
  })

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erreur lors de la création")
        return
      }

      router.push("/admin/blog")
    } catch {
      setError("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="text-sm text-neutral-500 hover:text-white transition-colors mb-4 inline-block"
        >
          &larr; Retour aux articles
        </Link>
        <h1 className="text-2xl font-light tracking-wide">Nouvel article</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="Titre de l'article"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            Extrait
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="Court résumé de l'article (affiché dans la liste)"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            Contenu <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            required
            rows={16}
            className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-y font-mono"
            placeholder="Contenu HTML de l'article"
          />
          <p className="text-xs text-neutral-600 mt-1">
            Accepte du HTML. Les balises &lt;h2&gt;, &lt;p&gt;, &lt;img&gt;, etc. seront rendues correctement.
          </p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            Image de couverture (URL)
          </label>
          <input
            type="url"
            value={form.coverImage}
            onChange={(e) => update("coverImage", e.target.value)}
            className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="https://..."
          />
        </div>

        {/* Published */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            className="w-4 h-4 accent-white"
          />
          <label htmlFor="published" className="text-sm text-neutral-300">
            Publier immédiatement
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Créer l'article"}
          </button>
          <Link
            href="/admin/blog"
            className="px-6 py-2.5 text-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
