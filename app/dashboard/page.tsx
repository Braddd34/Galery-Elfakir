import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { user } = session

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-neutral-500 text-sm">
              {user.name} ({user.role})
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Tableau de bord</h1>
        <p className="text-neutral-500 mb-12">Bienvenue, {user.name}</p>

        {/* Role-based content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Links */}
          {user.role === "ADMIN" && (
            <>
              <Link
                href="/admin/oeuvres"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Gérer les œuvres</h3>
                <p className="text-neutral-500 text-sm">
                  Valider, modifier ou supprimer les œuvres
                </p>
              </Link>
              <Link
                href="/admin/artistes"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Gérer les artistes</h3>
                <p className="text-neutral-500 text-sm">
                  Valider les nouveaux artistes
                </p>
              </Link>
              <Link
                href="/admin/commandes"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Commandes</h3>
                <p className="text-neutral-500 text-sm">
                  Voir et gérer les commandes
                </p>
              </Link>
            </>
          )}

          {/* Artist Links */}
          {user.role === "ARTIST" && (
            <>
              <Link
                href="/dashboard/artiste/oeuvres"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Mes œuvres</h3>
                <p className="text-neutral-500 text-sm">
                  Gérer mes œuvres en vente
                </p>
              </Link>
              <Link
                href="/dashboard/artiste/ventes"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Mes ventes</h3>
                <p className="text-neutral-500 text-sm">
                  Historique de mes ventes
                </p>
              </Link>
              <Link
                href="/dashboard/artiste/profil"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Mon profil</h3>
                <p className="text-neutral-500 text-sm">
                  Modifier mes informations
                </p>
              </Link>
            </>
          )}

          {/* Buyer Links */}
          {user.role === "BUYER" && (
            <>
              <Link
                href="/dashboard/commandes"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Mes commandes</h3>
                <p className="text-neutral-500 text-sm">
                  Historique de mes achats
                </p>
              </Link>
              <Link
                href="/dashboard/favoris"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Mes favoris</h3>
                <p className="text-neutral-500 text-sm">
                  Œuvres sauvegardées
                </p>
              </Link>
              <Link
                href="/dashboard/profil"
                className="bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-lg font-light mb-2">Mon profil</h3>
                <p className="text-neutral-500 text-sm">
                  Modifier mes informations
                </p>
              </Link>
            </>
          )}
        </div>

        {/* Quick Stats for Admin */}
        {user.role === "ADMIN" && (
          <div className="mt-12">
            <h2 className="text-xl font-light mb-6">Statistiques</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">0</p>
                <p className="text-neutral-500 text-sm mt-1">Œuvres</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">0</p>
                <p className="text-neutral-500 text-sm mt-1">Artistes</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">0</p>
                <p className="text-neutral-500 text-sm mt-1">Commandes</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">€0</p>
                <p className="text-neutral-500 text-sm mt-1">Revenus</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
