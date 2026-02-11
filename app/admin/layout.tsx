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
          <div className="flex items-center gap-8 h-12">
            <Link 
              href="/admin" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Vue d'ensemble
            </Link>
            <Link 
              href="/admin/oeuvres" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Œuvres
            </Link>
            <Link 
              href="/admin/artistes" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Artistes
            </Link>
            <Link 
              href="/admin/commandes" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Commandes
            </Link>
            <Link 
              href="/admin/utilisateurs" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Utilisateurs
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
