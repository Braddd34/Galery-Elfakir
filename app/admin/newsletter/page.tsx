"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/lib/toast-context"

interface Subscriber {
  id: string
  email: string
  active: boolean
  createdAt: string
}

export default function AdminNewsletterPage() {
  const { showToast } = useToast()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/admin/newsletter")
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
      }
    } catch {
      showToast("Erreur de chargement", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet abonné ?")) return
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id))
        showToast("Abonné supprimé", "success")
      } else {
        showToast("Erreur", "error")
      }
    } catch {
      showToast("Erreur", "error")
    }
  }

  const handleExportCSV = () => {
    const filtered = getFilteredSubscribers()
    const csv = "email,statut,date_inscription\n" + filtered.map(s =>
      `${s.email},${s.active ? "actif" : "inactif"},${new Date(s.createdAt).toLocaleDateString("fr-FR")}`
    ).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-abonnes-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getFilteredSubscribers = () => {
    return subscribers.filter(s => {
      const matchesFilter = filter === "all" || (filter === "active" && s.active) || (filter === "inactive" && !s.active)
      const matchesSearch = !search || s.email.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }

  const filtered = getFilteredSubscribers()
  const activeCount = subscribers.filter(s => s.active).length

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p className="text-neutral-500">Chargement...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light">Newsletter</h1>
            <p className="text-neutral-500 mt-1">
              {activeCount} abonné{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""} / {subscribers.length} total
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-neutral-700 text-sm hover:border-white transition-colors"
          >
            Exporter CSV
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par email..."
            className="flex-1 bg-black border border-neutral-700 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white focus:outline-none text-sm"
          />
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs border transition-colors ${
                  filter === f ? "border-white text-white bg-neutral-800" : "border-neutral-800 text-neutral-500 hover:text-white"
                }`}
              >
                {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Inactifs"}
              </button>
            ))}
          </div>
        </div>

        <p className="text-neutral-500 text-sm mb-4">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-neutral-800">
            <p className="text-neutral-500">Aucun abonné</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(subscriber => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-2 h-2 rounded-full ${subscriber.active ? "bg-green-500" : "bg-neutral-600"}`} />
                  <div>
                    <p className="text-white">{subscriber.email}</p>
                    <p className="text-neutral-500 text-xs">
                      Inscrit le {new Date(subscriber.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(subscriber.id)}
                  className="text-neutral-500 hover:text-red-400 text-sm transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
