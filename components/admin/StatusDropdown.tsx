"use client"

import { useState } from "react"
import { useToast } from "@/lib/toast-context"
import { useRouter } from "next/navigation"

const statuses = [
  { value: "DRAFT", label: "Brouillon", color: "bg-neutral-500" },
  { value: "PENDING", label: "En attente", color: "bg-yellow-500" },
  { value: "AVAILABLE", label: "Disponible", color: "bg-green-500" },
  { value: "RESERVED", label: "Réservé", color: "bg-blue-500" },
  { value: "SOLD", label: "Vendu", color: "bg-purple-500" },
  { value: "ARCHIVED", label: "Archivé", color: "bg-neutral-700" }
]

interface StatusDropdownProps {
  artworkId: string
  currentStatus: string
}

export default function StatusDropdown({ artworkId, currentStatus }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const currentStatusInfo = statuses.find(s => s.value === status) || statuses[0]

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) {
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/artworks/${artworkId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error("Erreur")

      setStatus(newStatus)
      showToast(`Statut changé en "${statuses.find(s => s.value === newStatus)?.label}"`, "success")
      router.refresh()
    } catch {
      showToast("Erreur lors du changement de statut", "error")
    } finally {
      setLoading(false)
      setIsOpen(false)
    }
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

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-40 bg-neutral-900 border border-neutral-700 shadow-lg z-50">
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
    </div>
  )
}
