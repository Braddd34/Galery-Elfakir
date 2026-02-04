"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(currentFilters.search || "")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || "")
  const [artistId, setArtistId] = useState(currentFilters.artistId || "all")
  const [sort, setSort] = useState(currentFilters.sort || "newest")

  // Appliquer les filtres
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (currentFilters.category && currentFilters.category !== "all") {
      params.set("category", currentFilters.category)
    }
    if (search.trim()) params.set("search", search.trim())
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (artistId && artistId !== "all") params.set("artistId", artistId)
    if (sort && sort !== "newest") params.set("sort", sort)
    
    const queryString = params.toString()
    router.push(queryString ? `/catalogue?${queryString}` : "/catalogue")
  }

  // Recherche au clavier (Enter)
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters()
    }
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    setArtistId("all")
    setSort("newest")
    router.push("/catalogue")
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = search || minPrice || maxPrice || (artistId && artistId !== "all") || (sort && sort !== "newest")

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Rechercher une œuvre, un artiste..."
            className="w-full bg-neutral-900 border border-neutral-700 px-5 py-4 pr-12 text-white placeholder:text-neutral-500 focus:border-white focus:outline-none transition-colors"
          />
          <button 
            onClick={applyFilters}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Bouton filtres avancés */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-5 py-4 border transition-colors ${
            showAdvanced || hasActiveFilters
              ? "border-white text-white"
              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm tracking-[0.1em] uppercase hidden sm:inline">Filtres</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-gold rounded-full" />
          )}
        </button>

        {/* Réinitialiser */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-neutral-500 hover:text-white transition-colors underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Filtres avancés (dépliables) */}
      {showAdvanced && (
        <div className="bg-neutral-900 border border-neutral-700 p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Filtre par prix */}
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-3">
              Prix
            </label>
            <div className="flex items-center gap-2">
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
          </div>

          {/* Filtre par artiste */}
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-3">
              Artiste
            </label>
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className="w-full bg-black border border-neutral-700 px-3 py-2 text-sm text-white focus:border-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">Tous les artistes</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 mb-3">
              Trier par
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-black border border-neutral-700 px-3 py-2 text-sm text-white focus:border-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="title">Titre A-Z</option>
            </select>
          </div>

          {/* Bouton appliquer */}
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full bg-white text-black py-2 text-sm tracking-[0.1em] uppercase font-medium hover:bg-gold transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
