"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  author: { name: string | null; image: string | null }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ? Cette action est irréversible.")) return

    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Blog</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Gérez les articles du journal
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-5 py-2.5 text-sm bg-white text-black hover:bg-neutral-200 transition-colors"
        >
          Nouvel article
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-neutral-500 py-20 text-center">Chargement…</div>
      ) : posts.length === 0 ? (
        <div className="border border-neutral-800 py-20 text-center">
          <p className="text-neutral-500 mb-4">Aucun article pour le moment</p>
          <Link
            href="/admin/blog/new"
            className="text-sm text-white underline underline-offset-4"
          >
            Créer le premier article
          </Link>
        </div>
      ) : (
        <div className="border border-neutral-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-neutral-500 font-normal">
                  Titre
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-neutral-500 font-normal">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-neutral-500 font-normal hidden md:table-cell">
                  Auteur
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-neutral-500 font-normal hidden md:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-neutral-500 font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-neutral-800/50 hover:bg-neutral-900/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{post.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      /{post.slug}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-neutral-400">
                      {post.author.name || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-neutral-500">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-xs text-neutral-400 hover:text-white transition-colors"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-xs text-red-500/70 hover:text-red-400 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
