"use client"

import { useCart, CartItem } from "@/lib/cart-context"
import { useState } from "react"

interface AddToCartButtonProps {
  artwork: CartItem
}

export default function AddToCartButton({ artwork }: AddToCartButtonProps) {
  const { addItem, removeItem, isInCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  
  const inCart = isInCart(artwork.id)

  const handleClick = () => {
    if (inCart) {
      removeItem(artwork.id)
    } else {
      setIsAdding(true)
      addItem(artwork)
      setTimeout(() => setIsAdding(false), 500)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleClick}
        disabled={isAdding}
        className={`w-full py-5 text-sm tracking-[0.15em] uppercase font-medium transition-colors ${
          inCart
            ? "bg-neutral-800 text-white hover:bg-neutral-700"
            : "bg-white text-black hover:bg-gold hover:text-black"
        } disabled:opacity-50`}
      >
        {isAdding ? (
          "Ajout en cours..."
        ) : inCart ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Dans le panier — Retirer
          </span>
        ) : (
          "Ajouter au panier"
        )}
      </button>
      
      <button className="w-full border border-neutral-700 py-5 text-sm tracking-[0.15em] uppercase hover:border-white transition-colors flex items-center justify-center gap-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Sauvegarder
      </button>
    </div>
  )
}
