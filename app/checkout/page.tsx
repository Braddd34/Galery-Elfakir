"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { trackCartEvent } from "@/lib/cart-tracking"

/**
 * Page de checkout (récapitulatif de commande).
 * 
 * Affiche le contenu du panier, permet de saisir l'adresse de livraison,
 * calcule les frais de port et affiche le total avant de passer au paiement.
 * Le panier est géré par le CartContext (localStorage "elfakir-cart").
 */

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
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items: cartItems, total: subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<"address" | "summary">("address")
  
  const [promoCode, setPromoCode] = useState("")
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [promoDiscount, setPromoDiscount] = useState<{
    code: string
    type: "percent" | "fixed"
    discountPercent?: number
    discountAmount?: number
    discount: number
  } | null>(null)

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

  // Vérifier la session
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login?callbackUrl=/checkout")
      return
    }
    // Pré-remplir l'email depuis la session
    if (session.user?.email) {
      setAddress(prev => ({ ...prev, email: session.user?.email || "" }))
    }
    setLoading(false)
  }, [session, status, router])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError("")

    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal })
      })
      const data = await res.json()

      if (!res.ok) {
        setPromoError(data.error || "Code invalide")
        setPromoDiscount(null)
        return
      }

      setPromoDiscount({
        code: data.code,
        type: data.type,
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        discount: data.discount
      })
      setPromoError("")
    } catch {
      setPromoError(t("checkout.networkError"))
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoDiscount(null)
    setPromoCode("")
    setPromoError("")
  }

  // Calculer les totaux
  const shippingRate = SHIPPING_RATES[address.country] || SHIPPING_RATES.OTHER
  const shipping = cartItems.length > 0 ? shippingRate.price : 0
  const discount = promoDiscount?.discount || 0
  const total = Math.max(0, subtotal - discount) + shipping

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("summary")
  }

  const [orderMessage, setOrderMessage] = useState("")

  const handleConfirmOrder = async () => {
    setSubmitting(true)
    
    for (const item of cartItems) {
      trackCartEvent(item.id, "checkout")
    }
    
    // Quand Stripe sera intégré, on créera une session de paiement ici.
    // En attendant, on affiche un message clair à l'utilisateur.
    setOrderMessage(t("checkout.paymentSoon"))
    setSubmitting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500">{t("checkout.loading")}</p>
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
          <h1 className="text-3xl font-light mb-4">{t("checkout.emptyCart")}</h1>
          <p className="text-neutral-500 mb-8">{t("checkout.emptyCartDesc")}</p>
          <Link href="/catalogue" className="inline-block px-8 py-3 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
            {t("checkout.viewCatalogue")}
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
            {t("checkout.continueShopping")}
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
            {t("checkout.step1")}
          </button>
          <div className="w-12 h-px bg-neutral-700" />
          <span className={`text-sm uppercase tracking-wider ${step === "summary" ? "text-white" : "text-neutral-500"}`}>
            {t("checkout.step2")}
          </span>
          <div className="w-12 h-px bg-neutral-700" />
          <span className="text-sm uppercase tracking-wider text-neutral-600">
            {t("checkout.step3")}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Colonne gauche : formulaire ou récapitulatif */}
          <div className="lg:col-span-7">
            {step === "address" ? (
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <h2 className="text-2xl font-light mb-6">{t("checkout.shippingAddress")}</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.firstName")}</label>
                    <input
                      type="text" name="firstName" value={address.firstName} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.lastName")}</label>
                    <input
                      type="text" name="lastName" value={address.lastName} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.email")}</label>
                    <input
                      type="email" name="email" value={address.email} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.phone")}</label>
                    <input
                      type="tel" name="phone" value={address.phone} onChange={handleAddressChange}
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">{t("checkout.address")}</label>
                  <input
                    type="text" name="address" value={address.address} onChange={handleAddressChange} required
                    className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    placeholder={t("checkout.addressPlaceholder")}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.postalCode")}</label>
                    <input
                      type="text" name="postalCode" value={address.postalCode} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.city")}</label>
                    <input
                      type="text" name="city" value={address.city} onChange={handleAddressChange} required
                      className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">{t("checkout.country")}</label>
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
                  {t("checkout.continueToSummary")}
                </button>
              </form>
            ) : (
              <div className="space-y-8">
                <h2 className="text-2xl font-light mb-6">{t("checkout.orderSummary")}</h2>

                {/* Adresse de livraison */}
                <div className="bg-neutral-900 border border-neutral-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm uppercase tracking-wider text-neutral-400">{t("checkout.shippingTo")}</h3>
                    <button onClick={() => setStep("address")} className="text-sm text-gold hover:underline">
                      {t("checkout.edit")}
                    </button>
                  </div>
                  <p>{address.firstName} {address.lastName}</p>
                  <p className="text-neutral-400">{address.address}</p>
                  <p className="text-neutral-400">{address.postalCode} {address.city}</p>
                  <p className="text-neutral-400">{shippingRate.label}</p>
                  {address.phone && <p className="text-neutral-500 text-sm mt-2">{address.phone}</p>}
                </div>

                {/* Œuvres */}
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-4 flex gap-4">
                      <Image src={item.image} alt={item.title} width={80} height={80} className="w-20 h-20 object-cover bg-neutral-800" />
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
                    <span>{t("checkout.certificateIncluded")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>{t("checkout.securePacking")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t("checkout.insuranceIncluded")}</span>
                  </div>
                </div>

                {/* Message affiché quand le paiement n'est pas encore disponible */}
                {orderMessage && (
                  <div className="bg-gold/10 border border-gold/30 p-6 text-center space-y-4">
                    <svg className="w-10 h-10 text-gold mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white text-sm font-medium">{orderMessage}</p>
                    <p className="text-neutral-400 text-xs">
                      {t("checkout.contactEmail")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/contact"
                        className="inline-block px-6 py-3 bg-white text-black text-sm uppercase tracking-wider hover:bg-gold transition-colors"
                      >
                        {t("about.contactUs")}
                      </Link>
                      <a
                        href="mailto:contact@elfakir.art"
                        className="inline-block px-6 py-3 border border-neutral-600 text-white text-sm uppercase tracking-wider hover:border-white transition-colors"
                      >
                        contact@elfakir.art
                      </a>
                    </div>
                  </div>
                )}

                {!orderMessage && (
                  <button
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                    className="w-full py-4 bg-white text-black text-sm uppercase tracking-wider font-medium hover:bg-gold transition-colors disabled:opacity-50"
                  >
                    {submitting ? t("checkout.processing") : t("checkout.proceedPayment")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Colonne droite : résumé du panier */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900 border border-neutral-800 p-8 sticky top-8">
              <h3 className="text-lg font-light mb-6">{t("checkout.yourCart")}</h3>

              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-400 truncate mr-4">{item.title}</span>
                    <span>€{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Code promo */}
              <div className="border-t border-neutral-800 pt-4 pb-4">
                {promoDiscount ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-4 py-3">
                    <div>
                      <p className="text-green-400 text-sm font-medium">
                        {t("checkout.promoCodeApplied").replace("{code}", promoDiscount.code)}
                      </p>
                      <p className="text-green-400/70 text-xs">
                        {promoDiscount.type === "percent"
                          ? `-${promoDiscount.discountPercent}%`
                          : `-€${promoDiscount.discountAmount}`
                        }
                        {" "}(−€{promoDiscount.discount.toLocaleString()})
                      </p>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-neutral-400 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder={t("checkout.promoPlaceholder")}
                        className="flex-1 bg-black border border-neutral-700 px-4 py-2 text-white text-sm focus:border-white focus:outline-none"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-neutral-800 text-white text-sm hover:bg-neutral-700 transition-colors disabled:opacity-50"
                      >
                        {promoLoading ? "..." : t("checkout.apply")}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-xs mt-2">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">{t("checkout.subtotal")}</span>
                  <span>€{subtotal.toLocaleString()}</span>
                </div>
                {promoDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">{t("checkout.discount")}</span>
                    <span className="text-green-400">−€{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">
                    {t("checkout.shipping")} ({shippingRate.label})
                  </span>
                  <span>€{shipping.toLocaleString()}</span>
                </div>
                <div className="border-t border-neutral-800 pt-3 flex justify-between text-lg">
                  <span>{t("checkout.total")}</span>
                  <span>€{total.toLocaleString()}</span>
                </div>
                <p className="text-neutral-600 text-xs">{t("checkout.vatIncluded")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
