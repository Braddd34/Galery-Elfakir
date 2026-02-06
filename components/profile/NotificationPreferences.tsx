"use client"

import { useState, useEffect } from "react"

interface NotificationSettings {
  notifyNewArtworks: boolean
  notifyPriceDrops: boolean
  notifyArtistNews: boolean
  notifyNewsletter: boolean
  notifyOrderUpdates: boolean
}

const notificationOptions = [
  {
    key: "notifyOrderUpdates",
    label: "Mises à jour des commandes",
    description: "Recevoir les notifications de suivi de vos commandes",
  },
  {
    key: "notifyNewArtworks",
    label: "Nouvelles œuvres",
    description: "Être informé des nouvelles œuvres ajoutées au catalogue",
  },
  {
    key: "notifyPriceDrops",
    label: "Alertes de prix",
    description: "Être notifié des baisses de prix sur vos favoris",
  },
  {
    key: "notifyArtistNews",
    label: "Actualités artistes",
    description: "Suivre l'actualité des artistes que vous appréciez",
  },
  {
    key: "notifyNewsletter",
    label: "Newsletter mensuelle",
    description: "Recevoir notre sélection mensuelle et les dernières nouvelles",
  },
]

export default function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>({
    notifyNewArtworks: true,
    notifyPriceDrops: true,
    notifyArtistNews: false,
    notifyNewsletter: true,
    notifyOrderUpdates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // Charger les préférences
  useEffect(() => {
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences) {
          setSettings(data.preferences)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Mettre à jour une préférence
  const handleToggle = async (key: keyof NotificationSettings) => {
    const newValue = !settings[key]
    setSaving(key)

    // Mettre à jour l'UI immédiatement
    setSettings((prev) => ({ ...prev, [key]: newValue }))

    try {
      const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      })

      if (!res.ok) {
        // Revenir à l'ancienne valeur en cas d'erreur
        setSettings((prev) => ({ ...prev, [key]: !newValue }))
      }
    } catch {
      // Revenir à l'ancienne valeur en cas d'erreur
      setSettings((prev) => ({ ...prev, [key]: !newValue }))
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900 border border-neutral-800 animate-pulse">
        <div className="h-6 bg-neutral-800 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800">
      <h3 className="text-lg font-light mb-6">Préférences de notification</h3>
      
      <div className="space-y-4">
        {notificationOptions.map((option) => {
          const key = option.key as keyof NotificationSettings
          const isEnabled = settings[key]
          const isSaving = saving === key

          return (
            <div
              key={option.key}
              className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0"
            >
              <div className="flex-1 pr-4">
                <p className="text-white font-medium text-sm">{option.label}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{option.description}</p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(key)}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  isEnabled ? "bg-green-500" : "bg-neutral-700"
                } ${isSaving ? "opacity-50" : ""}`}
                role="switch"
                aria-checked={isEnabled}
                aria-label={option.label}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    isEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
                {isSaving && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-neutral-600 text-xs mt-6">
        Vous pouvez modifier ces préférences à tout moment. Les notifications importantes 
        concernant votre compte seront toujours envoyées.
      </p>
    </div>
  )
}
