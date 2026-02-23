import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

const navLinks = [
  { href: "/dashboard/manager", label: "Vue d'ensemble" },
  { href: "/dashboard/manager/artistes", label: "Mes artistes" },
  { href: "/dashboard/manager/oeuvres", label: "Œuvres" },
  { href: "/dashboard/manager/stats", label: "Statistiques" },
  { href: "/dashboard/manager/export", label: "Export" },
]

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      {/* Mobile top nav */}
      <nav className="lg:hidden border-b border-neutral-800 bg-neutral-950">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <span className="text-xs text-neutral-500">{session.user.name}</span>
        </div>
        <div className="flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-sm px-3 py-1.5 rounded bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="px-4 pb-3">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            ← Tableau de bord
          </Link>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[250px] lg:shrink-0 border-r border-neutral-800 bg-neutral-950">
        <div className="p-6 border-b border-neutral-800">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <p className="text-xs text-neutral-500 mt-1">Espace gestionnaire</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 rounded text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <Link
            href="/dashboard"
            className="block px-3 py-2 text-sm text-neutral-500 hover:text-white transition-colors"
          >
            ← Tableau de bord
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 lg:p-10">
        {children}
      </main>
    </div>
  )
}
