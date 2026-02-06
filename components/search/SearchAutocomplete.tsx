"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface ArtworkSuggestion {
  id: string
  type: "artwork"
  title: string
  slug: string
  image: string | null
  price: number
  artistName: string
}

interface ArtistSuggestion {
  id: string
  type: "artist"
  name: string
  image: string | null
  artworksCount: number
}

interface Suggestions {
  artworks: ArtworkSuggestion[]
  artists: ArtistSuggestion[]
}

interface SearchAutocompleteProps {
  onSearch?: () => void
  className?: string
  inputClassName?: string
  placeholder?: string
}

export default function SearchAutocomplete({
  onSearch,
  className = "",
  inputClassName = "",
  placeholder = "Rechercher une œuvre, un artiste...",
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce pour éviter trop d'appels API
  const debounceRef = useRef<NodeJS.Timeout>()

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions(null)
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSuggestions(data.suggestions)
      setIsOpen(true)
    } catch {
      setSuggestions(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Effet pour les suggestions avec debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, fetchSuggestions])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(query.trim())}`)
      setQuery("")
      setIsOpen(false)
      onSearch?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions) return

    const totalItems = suggestions.artworks.length + suggestions.artists.length

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          // Naviguer vers l'item sélectionné
          if (selectedIndex < suggestions.artworks.length) {
            router.push(`/oeuvre/${suggestions.artworks[selectedIndex].slug}`)
          } else {
            const artistIndex = selectedIndex - suggestions.artworks.length
            router.push(`/artiste/${suggestions.artists[artistIndex].id}`)
          }
          setIsOpen(false)
          setQuery("")
          onSearch?.()
        } else {
          handleSubmit(e)
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  const hasSuggestions = suggestions && 
    (suggestions.artworks.length > 0 || suggestions.artists.length > 0)

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search" aria-label="Rechercher sur le site">
        <label htmlFor="search-autocomplete" className="sr-only">
          Rechercher une œuvre ou un artiste
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="search-autocomplete"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(-1)
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={inputClassName}
            autoComplete="off"
            aria-expanded={isOpen}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Lancer la recherche"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Dropdown suggestions */}
      {isOpen && hasSuggestions && (
        <div
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden z-50"
          role="listbox"
        >
          {/* Œuvres */}
          {suggestions.artworks.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                Œuvres
              </div>
              {suggestions.artworks.map((artwork, index) => (
                <Link
                  key={artwork.id}
                  href={`/oeuvre/${artwork.slug}`}
                  onClick={() => {
                    setIsOpen(false)
                    setQuery("")
                    onSearch?.()
                  }}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                    selectedIndex === index 
                      ? "bg-neutral-800" 
                      : "hover:bg-neutral-800/50"
                  }`}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  {/* Image */}
                  <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                    {artwork.image && (
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-light truncate">{artwork.title}</p>
                    <p className="text-neutral-500 text-sm truncate">{artwork.artistName}</p>
                  </div>
                  {/* Prix */}
                  <p className="text-white text-sm flex-shrink-0">
                    {artwork.price.toLocaleString("fr-FR")} €
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* Artistes */}
          {suggestions.artists.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                Artistes
              </div>
              {suggestions.artists.map((artist, index) => {
                const adjustedIndex = suggestions.artworks.length + index
                return (
                  <Link
                    key={artist.id}
                    href={`/artiste/${artist.id}`}
                    onClick={() => {
                      setIsOpen(false)
                      setQuery("")
                      onSearch?.()
                    }}
                    className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                      selectedIndex === adjustedIndex 
                        ? "bg-neutral-800" 
                        : "hover:bg-neutral-800/50"
                    }`}
                    role="option"
                    aria-selected={selectedIndex === adjustedIndex}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {artist.image ? (
                        <Image
                          src={artist.image}
                          alt={artist.name || "Artiste"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-neutral-500 text-sm">
                          {artist.name?.charAt(0).toUpperCase() || "A"}
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-light truncate">{artist.name}</p>
                      <p className="text-neutral-500 text-sm">
                        {artist.artworksCount} œuvre{artist.artworksCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Voir tous les résultats */}
          <Link
            href={`/catalogue?search=${encodeURIComponent(query)}`}
            onClick={() => {
              setIsOpen(false)
              setQuery("")
              onSearch?.()
            }}
            className="block px-4 py-3 text-center text-sm text-gold hover:bg-neutral-800/50 border-t border-neutral-800 transition-colors"
          >
            Voir tous les résultats pour "{query}"
          </Link>
        </div>
      )}

      {/* Message "pas de résultats" */}
      {isOpen && query.length >= 2 && !loading && !hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-6 text-center z-50">
          <p className="text-neutral-400">Aucun résultat pour "{query}"</p>
          <Link
            href="/catalogue"
            onClick={() => {
              setIsOpen(false)
              setQuery("")
              onSearch?.()
            }}
            className="inline-block mt-3 text-sm text-gold hover:underline"
          >
            Parcourir le catalogue
          </Link>
        </div>
      )}
    </div>
  )
}
