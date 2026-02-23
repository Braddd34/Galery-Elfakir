"use client"

import { useState, useEffect } from "react"

interface PromoCode {
  id: string
  code: string
  discountPercent: number | null
  discountAmount: number | null
  minPurchase: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  active: boolean
  createdAt: string
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    expiresAt: ""
  })

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch("/api/admin/promo-codes")
      const data = await res.json()
      setPromoCodes(data.promoCodes || [])
    } catch (err) {
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const body: Record<string, unknown> = {
        code: form.code
      }

      if (form.discountType === "percent") {
        body.discountPercent = parseFloat(form.discountValue)
      } else {
        body.discountAmount = parseFloat(form.discountValue)
      }

      if (form.minPurchase) body.minPurchase = parseFloat(form.minPurchase)
      if (form.maxUses) body.maxUses = parseInt(form.maxUses)
      if (form.expiresAt) body.expiresAt = form.expiresAt

      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création")
        return
      }

      setPromoCodes(prev => [data.promoCode, ...prev])
      setForm({ code: "", discountType: "percent", discountValue: "", minPurchase: "", maxUses: "", expiresAt: "" })
      setShowForm(false)
    } catch (err) {
      setError("Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setActionLoading(id)
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive })
      })

      if (res.ok) {
        setPromoCodes(prev =>
          prev.map(p => p.id === id ? { ...p, active: !currentActive } : p)
        )
      }
    } catch (err) {
      console.error("Erreur:", err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light mb-2">Codes promo</h1>
          <p className="text-neutral-500">Gérez les codes promotionnels de la galerie.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          {showForm ? "Annuler" : "+ Nouveau code"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
          <h2 className="text-lg font-light mb-4">Créer un code promo</h2>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2">{error}</p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
                placeholder="ex: BIENVENUE20"
                className="w-full bg-black border border-neutral-700 px-4 py-2 text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Type de réduction</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed" })}
                className="w-full bg-black border border-neutral-700 px-4 py-2 text-white focus:border-white focus:outline-none"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Valeur ({form.discountType === "percent" ? "%" : "€"})
              </label>
              <input
                type="number"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                required
                placeholder={form.discountType === "percent" ? "ex: 15" : "ex: 50"}
                className="w-full bg-black border border-neutral-700 px-4 py-2 text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Achat minimum (€, optionnel)</label>
              <input
                type="number"
                step="0.01"
                value={form.minPurchase}
                onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                placeholder="ex: 100"
                className="w-full bg-black border border-neutral-700 px-4 py-2 text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Utilisations max (optionnel)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="ex: 100"
                className="w-full bg-black border border-neutral-700 px-4 py-2 text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Date d'expiration (optionnel)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full bg-black border border-neutral-700 px-4 py-2 text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer le code"}
          </button>
        </form>
      )}

      {/* Tableau des codes promo */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">Aucun code promo pour le moment.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-sm text-neutral-400">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Réduction</th>
                  <th className="px-6 py-4">Min. achat</th>
                  <th className="px-6 py-4">Utilisations</th>
                  <th className="px-6 py-4">Expiration</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo) => {
                  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date()
                  const isMaxed = promo.maxUses !== null && promo.usedCount >= promo.maxUses

                  return (
                    <tr key={promo.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-neutral-800 px-3 py-1 rounded">
                          {promo.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {promo.discountPercent
                          ? <span className="text-green-400">{promo.discountPercent}%</span>
                          : <span className="text-green-400">€{promo.discountAmount}</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">
                        {promo.minPurchase ? `€${promo.minPurchase}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={isMaxed ? "text-red-400" : "text-neutral-300"}>
                          {promo.usedCount}{promo.maxUses !== null ? ` / ${promo.maxUses}` : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {promo.expiresAt ? (
                          <span className={isExpired ? "text-red-400" : "text-neutral-400"}>
                            {new Date(promo.expiresAt).toLocaleDateString("fr-FR")}
                            {isExpired && " (expiré)"}
                          </span>
                        ) : (
                          <span className="text-neutral-600">Illimité</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {promo.active && !isExpired && !isMaxed ? (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                            Actif
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-400 rounded">
                            {isExpired ? "Expiré" : isMaxed ? "Épuisé" : "Inactif"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(promo.id, promo.active)}
                          disabled={actionLoading === promo.id}
                          className={`text-xs px-3 py-1 rounded disabled:opacity-50 ${
                            promo.active
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                        >
                          {promo.active ? "Désactiver" : "Activer"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
