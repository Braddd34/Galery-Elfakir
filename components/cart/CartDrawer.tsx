"use client"

import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import { useEffect, useState } from "react"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, total, clearCart } = useCart()
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Bloquer le scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const handleRemove = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingId(null)
    }, 300)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer - responsive et animé */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-neutral-950 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl border-l border-neutral-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-light tracking-wider">Panier</h2>
            {items.length > 0 && (
              <span className="px-2.5 py-0.5 bg-white text-black text-xs font-medium rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:rotate-90"
            aria-label="Fermer le panier"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center flex-1">
              <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-neutral-400 mb-2 text-lg">Votre panier est vide</p>
              <p className="text-neutral-600 text-sm mb-6">Découvrez nos œuvres d'art uniques</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white text-black text-sm tracking-wider uppercase font-medium hover:bg-neutral-200 transition-all duration-200 hover:-translate-y-0.5"
              >
                Explorer le catalogue
              </button>
            </div>
          ) : (
            <>
              {/* Items - scroll fluide */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex gap-4 p-3 rounded-lg bg-neutral-900/50 transition-all duration-300 ${
                      removingId === item.id ? "opacity-0 translate-x-10 h-0 p-0 overflow-hidden" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Link 
                      href={`/oeuvre/${item.slug}`}
                      onClick={onClose}
                      className="w-20 h-24 bg-neutral-800 flex-shrink-0 overflow-hidden rounded"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <Link 
                          href={`/oeuvre/${item.slug}`}
                          onClick={onClose}
                          className="font-light hover:text-neutral-300 transition-colors line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-neutral-500 text-sm">{item.artistName}</p>
                      </div>
                      <p className="text-lg font-medium">€{item.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-neutral-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded transition-all duration-200 self-start"
                      aria-label={`Retirer ${item.title} du panier`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-800 space-y-4 bg-neutral-950">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-neutral-400 text-sm">Total</span>
                    <p className="text-2xl font-light">€{total.toLocaleString()}</p>
                  </div>
                  <span className="text-neutral-500 text-xs">
                    Livraison calculée à l'étape suivante
                  </span>
                </div>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="block w-full bg-white text-black py-4 text-center text-sm tracking-[0.15em] uppercase font-medium hover:bg-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10"
                >
                  Nous contacter pour commander
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-neutral-500 text-sm hover:text-red-400 transition-all duration-200 py-2"
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
