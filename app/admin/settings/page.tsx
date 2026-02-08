"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * Page de paramètres globaux pour l'administrateur.
 * Permet de configurer la commission, les frais de port, et d'autres paramètres.
 * Les valeurs sont stockées dans la table Settings de la base de données.
 */

interface Settings {
  commissionRate: number       // Taux de commission (%)
  shippingFR: number           // Frais de port France
  shippingEU: number           // Frais de port Europe
  shippingWorld: number        // Frais de port international
  freeShippingThreshold: number // Seuil livraison gratuite
  contactEmail: string         // Email de contact
  maxUploadSize: number        // Taille max upload (Mo)
}

const DEFAULT_SETTINGS: Settings = {
  commissionRate: 30,
  shippingFR: 25,
  shippingEU: 45,
  shippingWorld: 80,
  freeShippingThreshold: 5000,
  contactEmail: "contact@elfakir.art",
  maxUploadSize: 10
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...DEFAULT_SETTINGS, ...data })
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert("Erreur lors de la sauvegarde")
      }
    } catch {
      alert("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse space-y-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-neutral-900" />)}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">← Retour au tableau de bord</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Paramètres</h1>
        <p className="text-neutral-500 mb-12">Configuration globale de la galerie</p>

        <div className="space-y-8">
          {/* Commission */}
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <h2 className="text-lg font-light mb-4">Commission</h2>
            <p className="text-neutral-500 text-sm mb-4">
              Pourcentage prélevé sur chaque vente. Le reste est reversé à l'artiste.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0" max="100" step="0.5"
                value={settings.commissionRate}
                onChange={e => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                className="w-32 bg-black border border-neutral-700 px-4 py-3 text-white text-center focus:border-white focus:outline-none"
              />
              <span className="text-neutral-400">%</span>
              <span className="text-neutral-600 text-sm ml-4">
                → L'artiste reçoit {(100 - settings.commissionRate).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Frais de port */}
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <h2 className="text-lg font-light mb-4">Frais de livraison</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Tarifs de base pour l'expédition des œuvres selon la destination.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">France (€)</label>
                <input
                  type="number" min="0" step="1"
                  value={settings.shippingFR}
                  onChange={e => setSettings({ ...settings, shippingFR: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Europe (€)</label>
                <input
                  type="number" min="0" step="1"
                  value={settings.shippingEU}
                  onChange={e => setSettings({ ...settings, shippingEU: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">International (€)</label>
                <input
                  type="number" min="0" step="1"
                  value={settings.shippingWorld}
                  onChange={e => setSettings({ ...settings, shippingWorld: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-neutral-400 mb-2">Livraison gratuite à partir de (€)</label>
              <input
                type="number" min="0" step="100"
                value={settings.freeShippingThreshold}
                onChange={e => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className="w-48 bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
              />
              <p className="text-neutral-600 text-xs mt-1">0 = pas de livraison gratuite</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <h2 className="text-lg font-light mb-4">Contact</h2>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Email de contact</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full max-w-md bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Upload */}
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <h2 className="text-lg font-light mb-4">Upload</h2>
            <div className="flex items-center gap-4">
              <label className="text-sm text-neutral-400">Taille max par image</label>
              <input
                type="number" min="1" max="50"
                value={settings.maxUploadSize}
                onChange={e => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) || 10 })}
                className="w-24 bg-black border border-neutral-700 px-4 py-3 text-white text-center focus:border-white focus:outline-none"
              />
              <span className="text-neutral-400">Mo</span>
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-white text-black text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
            </button>
            {saved && (
              <span className="text-green-500 text-sm animate-fade-in">
                ✓ Paramètres enregistrés
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
