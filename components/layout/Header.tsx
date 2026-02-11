"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import CartButton from "@/components/cart/CartButton"
import SearchAutocomplete from "@/components/search/SearchAutocomplete"
import ThemeToggle from "@/components/ui/ThemeToggle"
import LanguageToggle from "@/components/ui/LanguageToggle"
import NotificationBell from "@/components/ui/NotificationBell"
import { useLanguage } from "@/components/providers/LanguageProvider"

const categories = [
  { href: "/catalogue?category=painting", labelKey: "nav.painting" },
  { href: "/catalogue?category=sculpture", labelKey: "nav.sculpture" },
  { href: "/catalogue?category=photography", labelKey: "nav.photography" },
  { href: "/catalogue?category=drawing", labelKey: "nav.drawing" },
  { href: "/catalogue?category=digital", labelKey: "nav.digitalArt" },
  { href: "/artistes", labelKey: "nav.artists" },
]

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <header role="banner">
      <nav 
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-neutral-800"
        aria-label="Navigation principale"
      >
        {/* Top Bar */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-xl md:text-2xl tracking-[0.3em] font-light text-white flex-shrink-0"
              aria-label="ELFAKIR - Retour à l'accueil"
            >
              ELFAKIR
            </Link>
            
            {/* Search Bar avec Autocomplete - Desktop */}
            <SearchAutocomplete
              className="hidden md:block flex-1 max-w-xl mx-8"
              inputClassName="w-full bg-transparent border border-neutral-700 px-4 py-2.5 pr-12 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
          
          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {session ? (
              <>
                <NotificationBell />
                <Link 
                  href="/dashboard/favoris" 
                  className="p-2.5 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                  aria-label={t("nav.myFavorites")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
                <CartButton />
                <Link 
                  href="/dashboard" 
                  className="p-2.5 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                  aria-label={t("nav.myAccount")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <CartButton />
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm text-white border border-neutral-700 hover:border-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {t("nav.login")}
                </Link>
              </>
            )}

          </div>

          {/* Mobile: Cart + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <CartButton />
            <button 
              className="p-2 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <div className="w-6 flex flex-col gap-1.5" aria-hidden="true">
                <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Bar - Desktop */}
      <div className="hidden md:block border-t border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-center gap-1">
            <Link 
              href="/catalogue"
              className="px-5 py-3 text-sm text-neutral-300 hover:text-white transition-colors"
            >
              {t("nav.allArtworks")}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-5 py-3 text-sm text-neutral-300 hover:text-white transition-colors"
              >
                {t(cat.labelKey)}
              </Link>
            ))}
            <Link 
              href="/contact"
              className="px-5 py-3 text-sm text-gold hover:opacity-80 transition-opacity"
            >
              {t("nav.contact")}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-neutral-800 bg-black">
          <div className="max-w-[1800px] mx-auto px-6 py-6">
            {/* Mobile Search avec Autocomplete */}
            <SearchAutocomplete
              className="mb-6"
              inputClassName="w-full bg-transparent border border-neutral-700 px-4 py-3 pr-12 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              placeholder="Rechercher..."
              onSearch={() => setMenuOpen(false)}
            />

            {/* Mobile Categories */}
            <div className="space-y-1 mb-6">
              <Link 
                href="/catalogue"
                className="block py-2 text-sm text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.allArtworks")}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="block py-2 text-sm text-neutral-400 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(cat.labelKey)}
                </Link>
              ))}
            </div>

            {/* Mobile Account */}
            <div className="pt-6 border-t border-neutral-800 space-y-3">
              {/* Langue et thème en mobile */}
              <div className="flex items-center gap-4 mb-4">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              
              {session ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block py-2 text-sm text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.myAccount")}
                  </Link>
                  <Link 
                    href="/dashboard/favoris" 
                    className="block py-2 text-sm text-neutral-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.myFavorites")}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="block py-2 text-sm text-neutral-500"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block py-2 text-sm text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.login")}
                </Link>
              )}
              <Link 
                href="/contact"
                className="block py-2 text-sm text-gold"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
    </header>
  )
}
