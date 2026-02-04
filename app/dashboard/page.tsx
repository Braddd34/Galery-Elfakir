import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"

// Statistiques pour l'admin
async function getAdminStats() {
  try {
    const [artworksCount, artistsCount, ordersCount, revenueData] = await Promise.all([
      prisma.artwork.count(),
      prisma.artistProfile.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { totalAmount: true }
      })
    ])
    
    return {
      artworks: artworksCount,
      artists: artistsCount,
      orders: ordersCount,
      revenue: revenueData._sum.totalAmount || 0
    }
  } catch {
    return { artworks: 0, artists: 0, orders: 0, revenue: 0 }
  }
}

// Statistiques pour l'artiste
async function getArtistStats(userId: string) {
  try {
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId },
      select: { id: true }
    })
    
    if (!artistProfile) return { artworks: 0, available: 0, sold: 0, revenue: 0 }
    
    const [artworksCount, availableCount, soldCount, salesData] = await Promise.all([
      prisma.artwork.count({ where: { artistId: artistProfile.id } }),
      prisma.artwork.count({ where: { artistId: artistProfile.id, status: "AVAILABLE" } }),
      prisma.artwork.count({ where: { artistId: artistProfile.id, status: "SOLD" } }),
      prisma.orderItem.aggregate({
        where: {
          artwork: { artistId: artistProfile.id, status: "SOLD" }
        },
        _sum: { price: true }
      })
    ])
    
    return {
      artworks: artworksCount,
      available: availableCount,
      sold: soldCount,
      revenue: salesData._sum.price || 0
    }
  } catch {
    return { artworks: 0, available: 0, sold: 0, revenue: 0 }
  }
}

// Statistiques pour l'acheteur
async function getBuyerStats(userId: string) {
  try {
    const [ordersCount, favoritesCount, totalSpent] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.order.aggregate({
        where: { userId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { totalAmount: true }
      })
    ])
    
    return {
      orders: ordersCount,
      favorites: favoritesCount,
      totalSpent: totalSpent._sum.totalAmount || 0
    }
  } catch {
    return { orders: 0, favorites: 0, totalSpent: 0 }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { user } = session
  
  // Récupérer les statistiques selon le rôle
  const adminStats = user.role === "ADMIN" ? await getAdminStats() : null
  const artistStats = user.role === "ARTIST" ? await getArtistStats(user.id) : null
  const buyerStats = user.role === "BUYER" ? await getBuyerStats(user.id) : null

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
        {user.role === "ADMIN" && adminStats && (
          <div className="mt-12">
            <h2 className="text-xl font-light mb-6">Statistiques</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">{adminStats.artworks}</p>
                <p className="text-neutral-500 text-sm mt-1">Œuvres</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">{adminStats.artists}</p>
                <p className="text-neutral-500 text-sm mt-1">Artistes</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">{adminStats.orders}</p>
                <p className="text-neutral-500 text-sm mt-1">Commandes</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">€{Number(adminStats.revenue).toLocaleString('fr-FR')}</p>
                <p className="text-neutral-500 text-sm mt-1">Revenus</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Stats for Artist */}
        {user.role === "ARTIST" && artistStats && (
          <div className="mt-12">
            <h2 className="text-xl font-light mb-6">Mes statistiques</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">{artistStats.artworks}</p>
                <p className="text-neutral-500 text-sm mt-1">Œuvres totales</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light text-green-500">{artistStats.available}</p>
                <p className="text-neutral-500 text-sm mt-1">Disponibles</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light text-purple-500">{artistStats.sold}</p>
                <p className="text-neutral-500 text-sm mt-1">Vendues</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light text-gold">€{Number(artistStats.revenue).toLocaleString('fr-FR')}</p>
                <p className="text-neutral-500 text-sm mt-1">Revenus</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Stats for Buyer */}
        {user.role === "BUYER" && buyerStats && (
          <div className="mt-12">
            <h2 className="text-xl font-light mb-6">Mon activité</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">{buyerStats.orders}</p>
                <p className="text-neutral-500 text-sm mt-1">Commandes</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light text-red-500">{buyerStats.favorites}</p>
                <p className="text-neutral-500 text-sm mt-1">Favoris</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <p className="text-3xl font-light">€{Number(buyerStats.totalSpent).toLocaleString('fr-FR')}</p>
                <p className="text-neutral-500 text-sm mt-1">Total dépensé</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
