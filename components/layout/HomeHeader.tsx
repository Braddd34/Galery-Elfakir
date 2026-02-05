"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CartButton from "@/components/cart/CartButton"

const categories = [
  { href: "/catalogue?category=painting", label: "Peinture" },
  { href: "/catalogue?category=sculpture", label: "Sculpture" },
  { href: "/catalogue?category=photography", label: "Photographie" },
  { href: "/catalogue?category=drawing", label: "Dessin" },
  { href: "/catalogue?category=digital", label: "Art numérique" },
  { href: "/artistes", label: "Artistes" },
]

export default function HomeHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Détecter le scroll pour changer le background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled || menuOpen 
        ? "bg-black/95 backdrop-blur-md border-b border-neutral-800" 
        : "bg-transparent"
    }`}>
      {/* Top Bar */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl tracking-[0.3em] font-light text-white flex-shrink-0">
            ELFAKIR
          </Link>
          
          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className={`hidden md:flex items-center flex-1 max-w-xl mx-8 border transition-all ${
              scrolled 
                ? searchFocused ? "border-white" : "border-neutral-700"
                : searchFocused ? "border-white/80" : "border-white/30"
            }`}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Rechercher une œuvre, un artiste..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-neutral-400 focus:outline-none"
            />
            <button 
              type="submit"
              className="px-4 py-2.5 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          
          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link 
                  href="/dashboard/favoris" 
                  className="p-2.5 text-white/70 hover:text-white transition-colors"
                  title="Mes favoris"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
                <CartButton />
                <Link 
                  href="/dashboard" 
                  className="p-2.5 text-white/70 hover:text-white transition-colors"
                  title="Mon compte"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <CartButton />
                <Link 
                  href="/login" 
                  className={`px-4 py-2 text-sm text-white border transition-colors ${
                    scrolled 
                      ? "border-neutral-700 hover:border-white" 
                      : "border-white/30 hover:border-white"
                  }`}
                >
                  Connexion
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Cart + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <CartButton />
            <button 
              className="p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-6 flex flex-col gap-1.5">
                <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Bar - Desktop (visible after scroll) */}
      <div className={`hidden md:block border-t border-neutral-800 transition-all duration-500 overflow-hidden ${
        scrolled ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-center gap-1">
            <Link 
              href="/catalogue"
              className="px-5 py-3 text-sm text-neutral-300 hover:text-white transition-colors"
            >
              Toutes les œuvres
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-5 py-3 text-sm text-neutral-300 hover:text-white transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <Link 
              href="/contact"
              className="px-5 py-3 text-sm text-gold hover:opacity-80 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-black">
          <div className="max-w-[1800px] mx-auto px-6 py-6">
            {/* Mobile Search */}
            <form 
              onSubmit={handleSearch}
              className="flex items-center border border-neutral-700 mb-6"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <button 
                type="submit"
                className="px-4 py-3 text-neutral-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Mobile Categories */}
            <div className="space-y-1 mb-6">
              <Link 
                href="/catalogue"
                className="block py-2 text-sm text-white"
                onClick={() => setMenuOpen(false)}
              >
                Toutes les œuvres
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="block py-2 text-sm text-neutral-400 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Mobile Account */}
            <div className="pt-6 border-t border-neutral-800 space-y-3">
              {session ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block py-2 text-sm text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mon compte
                  </Link>
                  <Link 
                    href="/dashboard/favoris" 
                    className="block py-2 text-sm text-neutral-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mes favoris
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="block py-2 text-sm text-neutral-500"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block py-2 text-sm text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
              <Link 
                href="/contact"
                className="block py-2 text-sm text-gold"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
