"use client"

import { useEffect, useState, useCallback } from "react"

interface AuditUser {
  name: string | null
  email: string
  role: string
}

interface AuditLog {
  id: string
  userId: string
  action: string
  target: string
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
  user: AuditUser
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

const ACTION_LABELS: Record<string, string> = {
  assign_artist: "Assigner artiste",
  unassign_artist: "Retirer artiste",
  update_artwork: "Modifier œuvre",
  create_artwork: "Créer œuvre",
  delete_artwork: "Supprimer œuvre",
  approve_artwork: "Approuver œuvre",
  update_user: "Modifier utilisateur",
  delete_user: "Supprimer utilisateur",
  create_order: "Créer commande",
  update_order: "Modifier commande",
  update_settings: "Modifier paramètres",
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [page, setPage] = useState(1)
  const [filterAction, setFilterAction] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [filterSearch, setFilterSearch] = useState("")

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "50")
      if (filterAction) params.set("action", filterAction)
      if (filterFrom) params.set("from", filterFrom)
      if (filterTo) params.set("to", filterTo)

      const res = await fetch(`/api/admin/audit?${params.toString()}`)
      if (!res.ok) throw new Error("Erreur lors du chargement")

      const json = await res.json()
      let filteredLogs = json.logs as AuditLog[]

      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase()
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.user.name?.toLowerCase().includes(q) ||
            log.user.email.toLowerCase().includes(q)
        )
      }

      setLogs(filteredLogs)
      setPagination(json.pagination)
    } catch {
      setError("Impossible de charger les logs d'audit")
    } finally {
      setLoading(false)
    }
  }, [page, filterAction, filterFrom, filterTo, filterSearch])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleFilterApply = () => {
    setPage(1)
    fetchLogs()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return "—"
    const entries = Object.entries(details)
    if (entries.length === 0) return "—"
    return entries
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")
  }

  return (
    <div>
      <h1 className="text-2xl font-light mb-8">Journal d&apos;audit</h1>

      {error && (
        <div className="mb-6 p-4 border border-red-800 bg-red-950 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Barre de filtres */}
      <div className="border border-neutral-800 bg-neutral-900 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-500"
            >
              <option value="">Toutes les actions</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Du</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Au</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Utilisateur</label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Nom ou email…"
              className="bg-neutral-800 border border-neutral-700 text-white text-sm px-3 py-1.5 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <button
            onClick={handleFilterApply}
            className="text-sm bg-white text-black px-4 py-1.5 hover:bg-neutral-200 transition-colors"
          >
            Filtrer
          </button>
        </div>
      </div>

      {/* Table des logs */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-neutral-500">Chargement…</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-900 p-8 text-center">
          <p className="text-neutral-500">Aucun log trouvé.</p>
        </div>
      ) : (
        <div className="border border-neutral-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-900 text-neutral-400 text-left">
                <th className="px-4 py-3 font-medium">Date/heure</th>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Cible</th>
                <th className="px-4 py-3 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={log.id}
                  className={index % 2 === 0 ? "bg-black" : "bg-neutral-950"}
                >
                  <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{log.user.name || "—"}</p>
                    <p className="text-neutral-600 text-xs">{log.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{log.target || "—"}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs max-w-xs truncate">
                    {formatDetails(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-neutral-500">
            Page {pagination.page} sur {pagination.totalPages} ({pagination.totalCount} entrées)
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-sm border border-neutral-700 px-4 py-1.5 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="text-sm border border-neutral-700 px-4 py-1.5 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
