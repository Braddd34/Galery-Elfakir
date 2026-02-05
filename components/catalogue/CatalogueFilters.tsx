"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Artist {
  id: string
  name: string
}

interface CatalogueFiltersProps {
  artists: Artist[]
  currentFilters: {
    search?: string
    minPrice?: string
    maxPrice?: string
    artistId?: string
    sort?: string
    category?: string
  }
}

export default function CatalogueFilters({ artists, currentFilters }: CatalogueFiltersProps) {
  const router = useRouter()
  
  const [showFilters, setShowFilters] = useState(false)
  const [showPrice, setShowPrice] = useState(false)
  const [showMedium, setShowMedium] = useState(false)
  const [showSort, setShowSort] = useState(false)
  
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || "")
  const [artistId, setArtistId] = useState(currentFilters.artistId || "all")
  const [sort, setSort] = useState(currentFilters.sort || "newest")

  const sortLabels: Record<string, string> = {
    newest: "Date de mise en ligne",
    oldest: "Plus ancien",
    price_asc: "Prix croissant",
    price_desc: "Prix décroissant",
    title: "Titre A-Z"
  }

  // Appliquer un filtre
  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams()
    
    if (currentFilters.category && currentFilters.category !== "all") {
      params.set("category", currentFilters.category)
    }
    if (currentFilters.search) params.set("search", currentFilters.search)
    
    // Gérer les prix
    if (key === "price") {
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
    } else {
      if (currentFilters.minPrice) params.set("minPrice", currentFilters.minPrice)
      if (currentFilters.maxPrice) params.set("maxPrice", currentFilters.maxPrice)
    }
    
    // Gérer l'artiste
    if (key === "artistId") {
      if (value && value !== "all") params.set("artistId", value)
    } else if (currentFilters.artistId && currentFilters.artistId !== "all") {
      params.set("artistId", currentFilters.artistId)
    }
    
    // Gérer le tri
    if (key === "sort") {
      if (value && value !== "newest") params.set("sort", value)
    } else if (currentFilters.sort && currentFilters.sort !== "newest") {
      params.set("sort", currentFilters.sort)
    }
    
    const queryString = params.toString()
    router.push(queryString ? `/catalogue?${queryString}` : "/catalogue")
    
    // Fermer les dropdowns
    setShowPrice(false)
    setShowMedium(false)
    setShowSort(false)
  }

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    setArtistId("all")
    setSort("newest")
    
    const params = new URLSearchParams()
    if (currentFilters.category && currentFilters.category !== "all") {
      params.set("category", currentFilters.category)
    }
    router.push(params.toString() ? `/catalogue?${params.toString()}` : "/catalogue")
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = currentFilters.minPrice || currentFilters.maxPrice || 
    (currentFilters.artistId && currentFilters.artistId !== "all") || 
    (currentFilters.sort && currentFilters.sort !== "newest")

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Bouton Filtres principal */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 text-sm border rounded transition-colors ${
          showFilters || hasActiveFilters
            ? "border-white text-white bg-white/10"
            : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtres
        {hasActiveFilters && <span className="w-1.5 h-1.5 bg-gold rounded-full" />}
      </button>

      {/* Prix Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowPrice(!showPrice)
            setShowMedium(false)
            setShowSort(false)
          }}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded transition-colors ${
            currentFilters.minPrice || currentFilters.maxPrice
              ? "border-white text-white"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
          }`}
        >
          Prix
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showPrice && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPrice(false)} />
            <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 p-4 z-50 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min €"
                  className="w-full bg-black border border-neutral-700 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max €"
                  className="w-full bg-black border border-neutral-700 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>
              <button
                onClick={() => applyFilter("price", "")}
                className="w-full bg-white text-black py-2 text-sm font-medium hover:bg-gold transition-colors"
              >
                Appliquer
              </button>
            </div>
          </>
        )}
      </div>

      {/* Artiste Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowMedium(!showMedium)
            setShowPrice(false)
            setShowSort(false)
          }}
          className={`flex items-center gap-1 px-4 py-2 text-sm border rounded transition-colors ${
            currentFilters.artistId && currentFilters.artistId !== "all"
              ? "border-white text-white"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
          }`}
        >
          Artiste
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showMedium && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMedium(false)} />
            <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 z-50 shadow-xl max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setArtistId("all")
                  applyFilter("artistId", "all")
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-800 ${
                  !currentFilters.artistId || currentFilters.artistId === "all" ? "text-white bg-neutral-800" : "text-neutral-300"
                }`}
              >
                Tous les artistes
              </button>
              {artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => {
                    setArtistId(artist.id)
                    applyFilter("artistId", artist.id)
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-800 ${
                    currentFilters.artistId === artist.id ? "text-white bg-neutral-800" : "text-neutral-300"
                  }`}
                >
                  {artist.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tout effacer */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Tout effacer
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tri Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSort(!showSort)
            setShowPrice(false)
            setShowMedium(false)
          }}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Trier par <span className="text-white">{sortLabels[currentFilters.sort || "newest"]}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showSort && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
            <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-700 z-50 shadow-xl">
              {Object.entries(sortLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSort(value)
                    applyFilter("sort", value)
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-800 ${
                    (currentFilters.sort || "newest") === value ? "text-white bg-neutral-800" : "text-neutral-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
