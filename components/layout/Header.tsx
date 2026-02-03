"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import CartButton from "@/components/cart/CartButton"

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl tracking-[0.3em] font-light text-white">
            ELFAKIR
          </Link>
          
          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-12">
            <Link href="/catalogue" className="text-sm tracking-[0.15em] uppercase text-white hover:opacity-60 transition-opacity">
              Collection
            </Link>
            <Link href="/artistes" className="text-sm tracking-[0.15em] uppercase text-white hover:opacity-60 transition-opacity">
              Artistes
            </Link>
            <Link href="/a-propos" className="text-sm tracking-[0.15em] uppercase text-white hover:opacity-60 transition-opacity">
              À propos
            </Link>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-6">
            {session ? (
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm tracking-[0.15em] uppercase text-white hover:opacity-60 transition-opacity"
                >
                  Mon compte
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm tracking-[0.15em] uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden md:block text-sm tracking-[0.15em] uppercase text-white hover:opacity-60 transition-opacity"
              >
                Connexion
              </Link>
            )}
            
            <Link href="/contact" className="hidden md:block text-sm tracking-[0.15em] uppercase text-white hover:opacity-60 transition-opacity">
              Contact
            </Link>

            {/* Cart Button */}
            <CartButton />

            {/* Menu Mobile Button */}
            <button 
              className="md:hidden p-2"
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

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden mt-8 pb-4 border-t border-neutral-800 pt-8">
            <div className="flex flex-col gap-6">
              <Link 
                href="/catalogue" 
                className="text-sm tracking-[0.15em] uppercase text-white"
                onClick={() => setMenuOpen(false)}
              >
                Collection
              </Link>
              <Link 
                href="/artistes" 
                className="text-sm tracking-[0.15em] uppercase text-white"
                onClick={() => setMenuOpen(false)}
              >
                Artistes
              </Link>
              <Link 
                href="/a-propos" 
                className="text-sm tracking-[0.15em] uppercase text-white"
                onClick={() => setMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                href="/contact" 
                className="text-sm tracking-[0.15em] uppercase text-white"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-6 border-t border-neutral-800">
                {session ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="block text-sm tracking-[0.15em] uppercase text-white mb-4"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mon compte
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="text-sm tracking-[0.15em] uppercase text-neutral-400"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="text-sm tracking-[0.15em] uppercase text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
