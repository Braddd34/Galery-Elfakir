"use client"

import { useCart } from "@/lib/cart-context"
import Link from "next/link"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, total, clearCart } = useCart()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-neutral-950 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-xl font-light tracking-wider">Panier</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-80px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-16 h-16 text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-neutral-500 mb-4">Votre panier est vide</p>
              <button
                onClick={onClose}
                className="text-sm text-white underline hover:text-neutral-300"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link 
                      href={`/oeuvre/${item.slug}`}
                      onClick={onClose}
                      className="w-24 h-24 bg-neutral-900 flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/oeuvre/${item.slug}`}
                        onClick={onClose}
                        className="font-light hover:text-neutral-300 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-neutral-500 text-sm mt-1">{item.artistName}</p>
                      <p className="text-lg mt-2">€{item.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-500 hover:text-white transition-colors self-start"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-800 space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>€{total.toLocaleString()}</span>
                </div>
                <p className="text-neutral-500 text-sm">
                  Frais de livraison calculés à l'étape suivante
                </p>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full bg-white text-black py-4 text-center text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold transition-colors"
                >
                  Commander
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-neutral-500 text-sm hover:text-white transition-colors"
                >
                  Vider le panier
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
