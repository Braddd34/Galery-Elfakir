"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-xl tracking-[0.3em] font-light hover:text-neutral-300 transition-colors">
            ELFAKIR
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/catalogue" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Catalogue
            </Link>
            <Link href="/artistes" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Artistes
            </Link>
            <Link href="/a-propos" className="text-sm text-neutral-400 hover:text-white transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {session ? (
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {session.user?.name}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden md:block text-sm border border-white px-6 py-2 hover:bg-white hover:text-black transition-all"
              >
                Connexion
              </Link>
            )}

            {/* Menu Mobile */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-6 flex flex-col gap-1.5">
                <span className={`block h-px bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-px bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-px bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Menu Mobile Ouvert */}
        {menuOpen && (
          <div className="md:hidden border-t border-neutral-800 py-6">
            <nav className="flex flex-col gap-4">
              <Link href="/catalogue" className="text-neutral-400 hover:text-white transition-colors py-2">
                Catalogue
              </Link>
              <Link href="/artistes" className="text-neutral-400 hover:text-white transition-colors py-2">
                Artistes
              </Link>
              <Link href="/a-propos" className="text-neutral-400 hover:text-white transition-colors py-2">
                À propos
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors py-2">
                Contact
              </Link>
              <div className="pt-4 border-t border-neutral-800">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block text-white py-2">
                      Mon compte
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-neutral-500 py-2"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="block text-white py-2">
                    Connexion
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
