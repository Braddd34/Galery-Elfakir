"use client"

import { useCart, CartItem } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { trackAddToCart } from "@/lib/analytics"
import { trackCartEvent } from "@/lib/cart-tracking"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface BuyNowButtonProps {
  artwork: CartItem
}

export default function BuyNowButton({ artwork }: BuyNowButtonProps) {
  const { addItem, isInCart } = useCart()
  const router = useRouter()
  const { t } = useLanguage()

  const handleBuyNow = () => {
    if (!isInCart(artwork.id)) {
      addItem(artwork)
      trackAddToCart({ id: artwork.id, title: artwork.title, price: artwork.price })
      trackCartEvent(artwork.id, "add")
    }
    router.push("/checkout")
  }

  return (
    <button
      onClick={handleBuyNow}
      className="w-full py-5 text-sm tracking-[0.15em] uppercase font-medium border border-white text-white hover:bg-white hover:text-black transition-colors"
    >
      {t("cart.buyNow")}
    </button>
  )
}
