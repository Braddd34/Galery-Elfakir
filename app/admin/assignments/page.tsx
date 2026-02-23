"use client"

import { useEffect, useState, useCallback } from "react"

interface Artist {
  id: string
  name: string | null
  email: string
  artworkCount: number
}

interface Manager {
  id: string
  name: string | null
  email: string
  artists: Artist[]
}

interface AllManager {
  id: string
  name: string | null
  email: string
}

interface AssignmentsData {
  managers: Manager[]
  unassignedArtists: Artist[]
  allManagers: AllManager[]
}

export default function AdminAssignmentsPage() {
  const [data, setData] = useState<AssignmentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedManagers, setSelectedManagers] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/assignments")
      if (!res.ok) throw new Error("Erreur lors du chargement")
      const json = await res.json()
      setData(json)
    } catch {
      setError("Impossible de charger les assignations")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showFeedback = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg)
      setError("")
    } else {
      setError(msg)
      setSuccess("")
    }
    setTimeout(() => { setSuccess(""); setError("") }, 4000)
  }

  const handleAssign = async (artistId: string) => {
    const managerId = selectedManagers[artistId]
    if (!managerId) {
      showFeedback("Veuillez sélectionner un gestionnaire", "error")
      return
    }

    setActionLoading(artistId)
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId, artistId }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Erreur lors de l'assignation")
      }
      showFeedback("Artiste assigné avec succès", "success")
      setSelectedManagers((prev) => {
        const copy = { ...prev }
        delete copy[artistId]
        return copy
      })
      await fetchData()
    } catch (err: any) {
      showFeedback(err.message || "Erreur lors de l'assignation", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (managerId: string, artistId: string) => {
    setActionLoading(`${managerId}-${artistId}`)
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId, artistId }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Erreur lors de la suppression")
      }
      showFeedback("Assignation retirée avec succès", "success")
      await fetchData()
    } catch (err: any) {
      showFeedback(err.message || "Erreur lors de la suppression", "error")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">Chargement…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-light mb-8">Assignation artistes — gestionnaires</h1>

      {success && (
        <div className="mb-6 p-4 border border-green-800 bg-green-950 text-green-300 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 border border-red-800 bg-red-950 text-red-300 text-sm">
          {error}
        </div>
      )}

      {data && data.allManagers.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-900 p-8 text-center">
          <p className="text-neutral-400">
            Aucun gestionnaire. Les utilisateurs peuvent s&apos;inscrire en tant que gestionnaire.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Gestionnaires et leurs artistes */}
          <div>
            <h2 className="text-lg font-light mb-4 text-neutral-300">Gestionnaires</h2>
            {data && data.managers.length === 0 ? (
              <p className="text-neutral-500 text-sm">Aucune assignation pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {data?.managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="border border-neutral-800 bg-neutral-900 p-5"
                  >
                    <div className="mb-3">
                      <p className="font-medium">{manager.name || "Sans nom"}</p>
                      <p className="text-neutral-500 text-sm">{manager.email}</p>
                    </div>
                    {manager.artists.length === 0 ? (
                      <p className="text-neutral-600 text-sm">Aucun artiste assigné</p>
                    ) : (
                      <ul className="space-y-2">
                        {manager.artists.map((artist) => (
                          <li
                            key={artist.id}
                            className="flex items-center justify-between border-t border-neutral-800 pt-2"
                          >
                            <div>
                              <p className="text-sm">{artist.name || "Sans nom"}</p>
                              <p className="text-neutral-600 text-xs">
                                {artist.artworkCount} œuvre{artist.artworkCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemove(manager.id, artist.id)}
                              disabled={actionLoading === `${manager.id}-${artist.id}`}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === `${manager.id}-${artist.id}` ? "…" : "Retirer"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne droite : Artistes non assignés */}
          <div>
            <h2 className="text-lg font-light mb-4 text-neutral-300">Artistes non assignés</h2>
            {data && data.unassignedArtists.length === 0 ? (
              <p className="text-neutral-500 text-sm">Tous les artistes sont assignés.</p>
            ) : (
              <div className="space-y-3">
                {data?.unassignedArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="border border-neutral-800 bg-neutral-900 p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate">{artist.name || "Sans nom"}</p>
                      <p className="text-neutral-600 text-xs">
                        {artist.artworkCount} œuvre{artist.artworkCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={selectedManagers[artist.id] || ""}
                        onChange={(e) =>
                          setSelectedManagers((prev) => ({
                            ...prev,
                            [artist.id]: e.target.value,
                          }))
                        }
                        className="bg-neutral-800 border border-neutral-700 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-neutral-500"
                      >
                        <option value="">Gestionnaire…</option>
                        {data?.allManagers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(artist.id)}
                        disabled={actionLoading === artist.id || !selectedManagers[artist.id]}
                        className="text-xs bg-white text-black px-3 py-1.5 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === artist.id ? "…" : "Assigner"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
