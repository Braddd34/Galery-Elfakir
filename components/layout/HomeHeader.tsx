"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import CartButton from "@/components/cart/CartButton"

export default function HomeHeader() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          
          {/* Navigation centrale */}
          <div className="hidden md:flex items-center gap-12">
            <Link href="/catalogue" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
              Collection
            </Link>
            <Link href="/artistes" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
              Artistes
            </Link>
            <Link href="/a-propos" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
              À propos
            </Link>
          </div>
          
          {/* Droite : Contact + Connexion + Panier */}
          <div className="flex items-center gap-6">
            <Link href="/contact" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
              Contact
            </Link>
            
            {session ? (
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity"
                >
                  Mon compte
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm tracking-[0.15em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden md:block text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity"
              >
                Connexion
              </Link>
            )}
            
            {/* Cart Button */}
            <CartButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
