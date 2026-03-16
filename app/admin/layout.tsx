import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"

// Empêcher Google d'indexer les pages admin (privées)
export const metadata: Metadata = {
  robots: { index: false, follow: false }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Header */}
      <header className="border-b border-neutral-800 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-lg tracking-[0.3em] font-light">
                ELFAKIR
              </Link>
              <span className="text-neutral-600">|</span>
              <span className="text-sm text-neutral-500">Administration</span>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Tableau de bord
              </Link>
              <Link 
                href="/" 
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Voir le site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 h-12 overflow-x-auto no-scrollbar">
            <Link 
              href="/admin" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Vue d&apos;ensemble
            </Link>
            <Link 
              href="/admin/oeuvres" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Œuvres
            </Link>
            <Link 
              href="/admin/artistes" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Artistes
            </Link>
            <Link 
              href="/admin/commandes" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Commandes
            </Link>
            <Link 
              href="/admin/users" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Utilisateurs
            </Link>
            <Link 
              href="/admin/assignments" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Assignations
            </Link>
            <Link 
              href="/admin/audit" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Journal d&apos;audit
            </Link>
            <Link 
              href="/admin/promo-codes" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Codes promo
            </Link>
            <Link 
              href="/admin/blog" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Blog
            </Link>
            <Link 
              href="/admin/virtual-exhibitions" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Expositions virtuelles
            </Link>
            <Link 
              href="/admin/newsletter" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Newsletter
            </Link>
            <Link 
              href="/admin/stats/abandons" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Stats abandons
            </Link>
            <Link 
              href="/admin/settings" 
              className="text-sm text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Paramètres
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
