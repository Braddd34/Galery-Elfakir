"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface FilterState {
  category: string
  minPrice: string
  maxPrice: string
  minWidth: string
  maxWidth: string
  minHeight: string
  maxHeight: string
  yearFrom: string
  yearTo: string
  sort: string
}

interface AdvancedFiltersProps {
  onViewChange?: (view: "grid" | "list") => void
  currentView?: "grid" | "list"
}

const categories = [
  { value: "all", label: "Toutes catégories" },
  { value: "painting", label: "Peinture" },
  { value: "sculpture", label: "Sculpture" },
  { value: "photography", label: "Photographie" },
  { value: "drawing", label: "Dessin" },
  { value: "print", label: "Estampe" },
  { value: "digital", label: "Art numérique" },
  { value: "mixed_media", label: "Technique mixte" },
]

const sortOptions = [
  { value: "recent", label: "Plus récentes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "popular", label: "Plus populaires" },
  { value: "year_desc", label: "Année (récent)" },
  { value: "year_asc", label: "Année (ancien)" },
]

export default function AdvancedFilters({ onViewChange, currentView = "grid" }: AdvancedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category") || "all",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minWidth: searchParams.get("minWidth") || "",
    maxWidth: searchParams.get("maxWidth") || "",
    minHeight: searchParams.get("minHeight") || "",
    maxHeight: searchParams.get("maxHeight") || "",
    yearFrom: searchParams.get("yearFrom") || "",
    yearTo: searchParams.get("yearTo") || "",
    sort: searchParams.get("sort") || "recent",
  })
  
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (filters.category && filters.category !== "all") {
      params.set("category", filters.category)
    }
    if (filters.minPrice) params.set("minPrice", filters.minPrice)
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
    if (filters.minWidth) params.set("minWidth", filters.minWidth)
    if (filters.maxWidth) params.set("maxWidth", filters.maxWidth)
    if (filters.minHeight) params.set("minHeight", filters.minHeight)
    if (filters.maxHeight) params.set("maxHeight", filters.maxHeight)
    if (filters.yearFrom) params.set("yearFrom", filters.yearFrom)
    if (filters.yearTo) params.set("yearTo", filters.yearTo)
    if (filters.sort && filters.sort !== "recent") {
      params.set("sort", filters.sort)
    }
    
    // Conserver la recherche existante
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    
    router.push(`/catalogue?${params.toString()}`)
  }
  
  const resetFilters = () => {
    setFilters({
      category: "all",
      minPrice: "",
      maxPrice: "",
      minWidth: "",
      maxWidth: "",
      minHeight: "",
      maxHeight: "",
      yearFrom: "",
      yearTo: "",
      sort: "recent",
    })
    router.push("/catalogue")
  }
  
  const hasActiveFilters = () => {
    return (
      filters.category !== "all" ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minWidth ||
      filters.maxWidth ||
      filters.minHeight ||
      filters.maxHeight ||
      filters.yearFrom ||
      filters.yearTo
    )
  }
  
  // Générer les années disponibles
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
  
  return (
    <div className="space-y-4">
      {/* Barre principale */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Catégorie */}
        <select
          value={filters.category}
          onChange={(e) => {
            setFilters({ ...filters, category: e.target.value })
            // Appliquer immédiatement pour la catégorie
            const params = new URLSearchParams(searchParams.toString())
            if (e.target.value === "all") {
              params.delete("category")
            } else {
              params.set("category", e.target.value)
            }
            router.push(`/catalogue?${params.toString()}`)
          }}
          className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-white focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        
        {/* Tri */}
        <select
          value={filters.sort}
          onChange={(e) => {
            setFilters({ ...filters, sort: e.target.value })
            const params = new URLSearchParams(searchParams.toString())
            if (e.target.value === "recent") {
              params.delete("sort")
            } else {
              params.set("sort", e.target.value)
            }
            router.push(`/catalogue?${params.toString()}`)
          }}
          className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-white focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Bouton filtres avancés */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showAdvanced || hasActiveFilters()
              ? "border-white bg-white text-black"
              : "border-neutral-700 hover:border-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filtres avancés
          {hasActiveFilters() && (
            <span className="bg-white text-black text-xs px-1.5 py-0.5 rounded-full ml-1">
              !
            </span>
          )}
        </button>
        
        {/* Reset filtres */}
        {hasActiveFilters() && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Réinitialiser
          </button>
        )}
        
        {/* Séparateur */}
        <div className="flex-1" />
        
        {/* Toggle vue */}
        <div className="flex border border-neutral-700 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange?.("grid")}
            className={`p-2 transition-colors ${
              currentView === "grid" ? "bg-white text-black" : "hover:bg-neutral-800"
            }`}
            title="Vue grille"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewChange?.("list")}
            className={`p-2 transition-colors ${
              currentView === "list" ? "bg-white text-black" : "hover:bg-neutral-800"
            }`}
            title="Vue liste"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Panneau filtres avancés */}
      {showAdvanced && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Prix */}
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-3">Prix (€)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
                <span className="flex items-center text-neutral-500">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
              </div>
            </div>
            
            {/* Dimensions - Largeur */}
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-3">Largeur (cm)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minWidth}
                  onChange={(e) => setFilters({ ...filters, minWidth: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
                <span className="flex items-center text-neutral-500">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxWidth}
                  onChange={(e) => setFilters({ ...filters, maxWidth: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
              </div>
            </div>
            
            {/* Dimensions - Hauteur */}
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-3">Hauteur (cm)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minHeight}
                  onChange={(e) => setFilters({ ...filters, minHeight: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
                <span className="flex items-center text-neutral-500">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxHeight}
                  onChange={(e) => setFilters({ ...filters, maxHeight: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
              </div>
            </div>
            
            {/* Année */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-neutral-400 mb-3">Année de création</h4>
              <div className="flex gap-2">
                <select
                  value={filters.yearFrom}
                  onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                >
                  <option value="">De</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="flex items-center text-neutral-500">—</span>
                <select
                  value={filters.yearTo}
                  onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                >
                  <option value="">À</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Bouton appliquer */}
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-6 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
