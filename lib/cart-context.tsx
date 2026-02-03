"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Type pour un item du panier
export interface CartItem {
  id: string
  slug: string
  title: string
  price: number
  image: string
  artistName: string
}

// Type pour le contexte
interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Clé localStorage
const CART_STORAGE_KEY = "elfakir-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error)
    }
    setIsLoaded(true)
  }, [])

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isLoaded])

  // Ajouter un item (les œuvres sont uniques, pas de quantité)
  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Vérifier si déjà dans le panier
      if (prev.some((i) => i.id === item.id)) {
        return prev
      }
      return [...prev, item]
    })
  }

  // Retirer un item
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Vider le panier
  const clearCart = () => {
    setItems([])
  }

  // Vérifier si un item est dans le panier
  const isInCart = (id: string) => {
    return items.some((item) => item.id === id)
  }

  // Nombre d'items
  const itemCount = items.length

  // Total
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook pour utiliser le contexte
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
