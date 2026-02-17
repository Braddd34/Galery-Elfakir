"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface CatalogueViewToggleProps {
  currentView: "grid" | "list"
}

export default function CatalogueViewToggle({ currentView }: CatalogueViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  
  const changeView = (view: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString())
    if (view === "grid") {
      params.delete("view")
    } else {
      params.set("view", view)
    }
    router.push(`/catalogue?${params.toString()}`)
  }
  
  return (
    <div className="flex border border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={() => changeView("grid")}
        className={`p-2 transition-colors ${
          currentView === "grid" ? "bg-white text-black" : "hover:bg-neutral-800"
        }`}
        title={t("view.grid")}
        aria-label={t("view.grid")}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => changeView("list")}
        className={`p-2 transition-colors ${
          currentView === "list" ? "bg-white text-black" : "hover:bg-neutral-800"
        }`}
        title={t("view.list")}
        aria-label={t("view.list")}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  )
}
