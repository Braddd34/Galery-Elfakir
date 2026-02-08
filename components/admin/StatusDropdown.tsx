"use client"

import { useState } from "react"
import { useToast } from "@/lib/toast-context"
import { useRouter } from "next/navigation"

/**
 * Dropdown pour changer le statut d'une œuvre côté admin.
 * Quand on rejette une œuvre (statut → ARCHIVED ou DRAFT),
 * une modale s'affiche pour saisir un commentaire/motif de refus.
 * Ce commentaire est envoyé à l'artiste via notification.
 */

const statuses = [
  { value: "DRAFT", label: "Brouillon", color: "bg-neutral-500" },
  { value: "PENDING", label: "En attente", color: "bg-yellow-500" },
  { value: "AVAILABLE", label: "Approuver ✓", color: "bg-green-500" },
  { value: "RESERVED", label: "Réservé", color: "bg-blue-500" },
  { value: "SOLD", label: "Vendu", color: "bg-purple-500" },
  { value: "ARCHIVED", label: "Rejeter ✗", color: "bg-red-500" }
]

interface StatusDropdownProps {
  artworkId: string
  currentStatus: string
}

export default function StatusDropdown({ artworkId, currentStatus }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectComment, setRejectComment] = useState("")
  const [pendingStatus, setPendingStatus] = useState("")
  const { showToast } = useToast()
  const router = useRouter()

  const displayStatuses = [
    { value: "DRAFT", label: "Brouillon", color: "bg-neutral-500" },
    { value: "PENDING", label: "En attente", color: "bg-yellow-500" },
    { value: "AVAILABLE", label: "Disponible", color: "bg-green-500" },
    { value: "RESERVED", label: "Réservé", color: "bg-blue-500" },
    { value: "SOLD", label: "Vendu", color: "bg-purple-500" },
    { value: "ARCHIVED", label: "Archivé", color: "bg-neutral-700" }
  ]
  const currentStatusInfo = displayStatuses.find(s => s.value === status) || displayStatuses[0]

  const handleStatusChange = async (newStatus: string, comment?: string) => {
    if (newStatus === status && !comment) {
      setIsOpen(false)
      return
    }

    // Si c'est un rejet et qu'il n'y a pas encore de commentaire, afficher la modale
    if ((newStatus === "ARCHIVED" || newStatus === "DRAFT") && status === "PENDING" && !comment) {
      setPendingStatus(newStatus)
      setShowRejectModal(true)
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/artworks/${artworkId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, comment })
      })

      if (!res.ok) throw new Error("Erreur")

      setStatus(newStatus)
      const statusLabel = displayStatuses.find(s => s.value === newStatus)?.label
      showToast(`Statut changé en "${statusLabel}"`, "success")
      router.refresh()
    } catch {
      showToast("Erreur lors du changement de statut", "error")
    } finally {
      setLoading(false)
      setIsOpen(false)
      setShowRejectModal(false)
      setRejectComment("")
    }
  }

  const handleRejectSubmit = () => {
    handleStatusChange(pendingStatus, rejectComment || "Aucun motif précisé")
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1 text-sm rounded transition-colors ${
          loading ? "opacity-50" : "hover:bg-neutral-800"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${currentStatusInfo.color}`} />
        <span className={currentStatusInfo.color.replace("bg-", "text-").replace("-500", "-400").replace("-700", "-500")}>
          {currentStatusInfo.label}
        </span>
        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-44 bg-neutral-900 border border-neutral-700 shadow-lg z-50">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-800 transition-colors ${
                  s.value === status ? "bg-neutral-800" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modale de rejet avec commentaire */}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[100]" onClick={() => setShowRejectModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-neutral-900 border border-neutral-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-light mb-2">Motif du refus</h3>
            <p className="text-neutral-500 text-sm mb-4">
              Expliquez à l'artiste pourquoi son œuvre est refusée. Ce message sera envoyé par notification.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Ex: La qualité des images est insuffisante, veuillez refaire les photos..."
              rows={4}
              className="w-full bg-black border border-neutral-700 px-4 py-3 text-white text-sm focus:border-white focus:outline-none resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 text-white text-sm uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Traitement..." : "Confirmer le refus"}
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setRejectComment("") }}
                className="px-6 py-3 border border-neutral-700 text-sm hover:border-white transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
