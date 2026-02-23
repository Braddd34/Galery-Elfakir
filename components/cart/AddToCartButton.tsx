"use client"

import { useCart, CartItem } from "@/lib/cart-context"
import { useState } from "react"
import FavoriteButton from "@/components/ui/FavoriteButton"
import { useToast } from "@/lib/toast-context"
import { trackAddToCart } from "@/lib/analytics"
import { trackCartEvent } from "@/lib/cart-tracking"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface AddToCartButtonProps {
  artwork: CartItem
}

export default function AddToCartButton({ artwork }: AddToCartButtonProps) {
  const { addItem, removeItem, isInCart } = useCart()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [isAdding, setIsAdding] = useState(false)
  
  const inCart = isInCart(artwork.id)

  const handleClick = () => {
    if (inCart) {
      removeItem(artwork.id)
      trackCartEvent(artwork.id, "remove")
      showToast(t("cart.removedToast"), "info")
    } else {
      setIsAdding(true)
      addItem(artwork)
      showToast(t("cart.addedToast"), "success")
      trackAddToCart({ id: artwork.id, title: artwork.title, price: artwork.price })
      trackCartEvent(artwork.id, "add")
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
          t("cart.adding")
        ) : inCart ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t("cart.inCart")}
          </span>
        ) : (
          t("cart.add")
        )}
      </button>
      
      <FavoriteButton artworkId={artwork.id} className="w-full" />
    </div>
  )
}
