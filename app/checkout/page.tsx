"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * Page de checkout (récapitulatif de commande).
 * 
 * Affiche le contenu du panier, permet de saisir l'adresse de livraison,
 * calcule les frais de port et affiche le total avant de passer au paiement.
 * Le panier est stocké dans localStorage (géré par le store zustand).
 */

interface CartItem {
  id: string
  slug: string
  title: string
  price: number
  image: string
  artistName: string
}

// Frais de port selon le pays
const SHIPPING_RATES: Record<string, { label: string; price: number }> = {
  FR: { label: "France métropolitaine", price: 25 },
  BE: { label: "Belgique", price: 35 },
  CH: { label: "Suisse", price: 45 },
  LU: { label: "Luxembourg", price: 35 },
  DE: { label: "Allemagne", price: 40 },
  ES: { label: "Espagne", price: 45 },
  IT: { label: "Italie", price: 45 },
  GB: { label: "Royaume-Uni", price: 55 },
  US: { label: "États-Unis", price: 120 },
  CA: { label: "Canada", price: 110 },
  OTHER: { label: "Autre pays", price: 80 }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<"address" | "summary">("address")
  
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR"
  })

  // Charger le panier depuis localStorage
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login?callbackUrl=/checkout")
      return
    }

    try {
      const stored = localStorage.getItem("cart-storage")
      if (stored) {
        const parsed = JSON.parse(stored)
        const items = parsed?.state?.items || []
        setCartItems(items)
      }
    } catch {}
    setLoading(false)
  }, [session, status, router])

  // Calculer les totaux
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const shippingRate = SHIPPING_RATES[address.country] || SHIPPING_RATES.OTHER
  const shipping = cartItems.length > 0 ? shippingRate.price : 0
  const total = subtotal + shipping

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("summary")
  }

  const handleConfirmOrder = async () => {
    setSubmitting(true)
    
    // Pour l'instant, sans Stripe, on affiche un message
    // Quand Stripe sera intégré, on créera une session de paiement ici
    alert("Le paiement Stripe n'est pas encore configuré. Cette page sera fonctionnelle une fois Stripe intégré.")
    setSubmitting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-light mb-4">Votre panier est vide</h1>
          <p className="text-neutral-500 mb-8">Ajoutez des œuvres à votre panier pour passer commande.</p>
          <Link href="/catalogue" className="inline-block px-8 py-3 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
            Voir le catalogue
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
          <Link href="/catalogue" className="text-neutral-400 hover:text-white text-sm">
            ← Continuer vos achats
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Étapes */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => setStep("address")}
            className={`text-sm uppercase tracking-wider ${step === "address" ? "text-white" : "text-neutral-500"}`}
          >
            1. Adresse
          </button>
          <div className="w-12 h-px bg-neutral-700" />
          <span className={`text-sm uppercase tracking-wider ${step === "summary" ? "text-white" : "text-neutral-500"}`}>
            2. Récapitulatif
          </span>
          <div className="w-12 h-px bg-neutral-700" />
          <span className="text-sm uppercase tracking-wider text-neutral-600">
            3. Paiement
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Colonne gauche : formulaire ou récapitulatif */}
          <div className="lg:col-span-7">
            {step === "address" ? (
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <h2 className="text-2xl font-light mb-6">Adresse de livraison</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Prénom *</label>
                    <input
                      type="text" name="firstName" value={address.firstName} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Nom *</label>
                    <input
                      type="text" name="lastName" value={address.lastName} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Email *</label>
                    <input
                      type="email" name="email" value={address.email} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Téléphone</label>
                    <input
                      type="tel" name="phone" value={address.phone} onChange={handleAddressChange}
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Adresse *</label>
                  <input
                    type="text" name="address" value={address.address} onChange={handleAddressChange} required
                    className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Code postal *</label>
                    <input
                      type="text" name="postalCode" value={address.postalCode} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Ville *</label>
                    <input
                      type="text" name="city" value={address.city} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Pays *</label>
                    <select
                      name="country" value={address.country} onChange={handleAddressChange}
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none appearance-none cursor-pointer"
                    >
                      {Object.entries(SHIPPING_RATES).map(([code, { label }]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-white text-black text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors mt-8"
                >
                  Continuer vers le récapitulatif
                </button>
              </form>
            ) : (
              <div className="space-y-8">
                <h2 className="text-2xl font-light mb-6">Récapitulatif de commande</h2>

                {/* Adresse de livraison */}
                <div className="bg-neutral-900 border border-neutral-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm uppercase tracking-wider text-neutral-400">Livraison à</h3>
                    <button onClick={() => setStep("address")} className="text-sm text-gold hover:underline">
                      Modifier
                    </button>
                  </div>
                  <p>{address.firstName} {address.lastName}</p>
                  <p className="text-neutral-400">{address.address}</p>
                  <p className="text-neutral-400">{address.postalCode} {address.city}</p>
                  <p className="text-neutral-400">{shippingRate.label}</p>
                  {address.phone && <p className="text-neutral-500 text-sm mt-2">Tél: {address.phone}</p>}
                </div>

                {/* Œuvres */}
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-4 flex gap-4">
                      <img src={item.image} alt={item.title} className="w-20 h-20 object-cover bg-neutral-800" />
                      <div className="flex-1">
                        <h4 className="font-light">{item.title}</h4>
                        <p className="text-neutral-500 text-sm">{item.artistName}</p>
                      </div>
                      <p className="text-lg">€{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Garanties */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Certificat d'authenticité inclus</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Emballage professionnel sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Assurance transport incluse</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="w-full py-4 bg-white text-black text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Traitement..." : "Procéder au paiement"}
                </button>
              </div>
            )}
          </div>

          {/* Colonne droite : résumé du panier */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900 border border-neutral-800 p-8 sticky top-8">
              <h3 className="text-lg font-light mb-6">Votre panier</h3>

              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-400 truncate mr-4">{item.title}</span>
                    <span>€{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Sous-total</span>
                  <span>€{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">
                    Livraison ({shippingRate.label})
                  </span>
                  <span>€{shipping.toLocaleString()}</span>
                </div>
                <div className="border-t border-neutral-800 pt-3 flex justify-between text-lg">
                  <span>Total</span>
                  <span>€{total.toLocaleString()}</span>
                </div>
                <p className="text-neutral-600 text-xs">TVA incluse</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
