"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"

interface FavoritesContextValue {
  favoriteIds: Set<string>
  toggle: (artworkId: string) => Promise<boolean>
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  toggle: async () => false,
  isLoading: false,
})

export function useFavorites() {
  return useContext(FavoritesContext)
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!session?.user) {
      setFavoriteIds(new Set())
      fetched.current = false
      return
    }
    if (fetched.current) return
    fetched.current = true

    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.favoriteIds) {
          setFavoriteIds(new Set(data.favoriteIds))
        }
      })
      .catch(() => {})
  }, [session])

  const toggle = useCallback(
    async (artworkId: string): Promise<boolean> => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artworkId }),
        })
        if (!res.ok) return favoriteIds.has(artworkId)
        const data = await res.json()
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (data.isFavorite) next.add(artworkId)
          else next.delete(artworkId)
          return next
        })
        return data.isFavorite
      } catch {
        return favoriteIds.has(artworkId)
      } finally {
        setIsLoading(false)
      }
    },
    [favoriteIds]
  )

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggle, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  )
}
