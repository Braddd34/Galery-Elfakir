"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useLanguage } from "@/components/providers/LanguageProvider"

export default function DeleteAccountSection() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setError("")
    if (confirm !== "SUPPRIMER") {
      setError(t("deleteAccount.confirmRequired"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm, password: password || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || t("deleteAccount.error"))
        setLoading(false)
        return
      }
      await signOut({ callbackUrl: "/?account_deleted=1" })
    } catch {
      setError(t("deleteAccount.error"))
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-neutral-400 text-sm mb-4">
        {t("deleteAccount.description")}
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-block px-6 py-3 border border-red-700 text-red-400 text-sm hover:bg-red-950/30 transition-colors"
        >
          {t("deleteAccount.button")}
        </button>
      ) : (
        <div className="border border-red-800 bg-red-950/10 p-6 space-y-4">
          <p className="text-sm text-red-300 font-medium">
            {t("deleteAccount.warning")}
          </p>
          <ul className="text-xs text-neutral-400 list-disc pl-5 space-y-1">
            <li>{t("deleteAccount.warning1")}</li>
            <li>{t("deleteAccount.warning2")}</li>
            <li>{t("deleteAccount.warning3")}</li>
          </ul>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              {t("deleteAccount.passwordLabel")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder={t("deleteAccount.passwordPlaceholder")}
              className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            />
            <p className="text-xs text-neutral-500 mt-2">
              {t("deleteAccount.passwordHelp")}
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              {t("deleteAccount.typeConfirm")}
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 border border-red-800 p-3">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setOpen(false)
                setError("")
                setPassword("")
                setConfirm("")
              }}
              disabled={loading}
              className="flex-1 border border-neutral-700 text-sm py-3 hover:border-white transition-colors disabled:opacity-50"
            >
              {t("deleteAccount.cancel")}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirm !== "SUPPRIMER"}
              className="flex-1 bg-red-700 text-white text-sm py-3 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? t("deleteAccount.deleting") : t("deleteAccount.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
