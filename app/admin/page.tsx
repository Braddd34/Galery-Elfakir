import prisma from "@/lib/prisma"
import Link from "next/link"

async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Comptes généraux
  const [
    totalArtworks,
    availableArtworks,
    pendingArtworks,
    soldArtworks,
    totalArtists,
    totalUsers,
    totalOrders,
    paidOrders,
    recentOrders,
    recentArtworks,
    newsletterCount
  ] = await Promise.all([
    prisma.artwork.count(),
    prisma.artwork.count({ where: { status: "AVAILABLE" } }),
    prisma.artwork.count({ where: { status: "PENDING" } }),
    prisma.artwork.count({ where: { status: "SOLD" } }),
    prisma.artistProfile.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        artwork: { select: { title: true } }
      }
    }),
    prisma.artwork.findMany({
      where: { createdAt: { gte: startOfMonth } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        artist: {
          include: { user: { select: { name: true } } }
        }
      }
    }),
    prisma.newsletterSubscriber.count({ where: { active: true } })
  ])

  // Calculer le chiffre d'affaires
  const revenue = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true }
  })

  const monthlyRevenue = await prisma.order.aggregate({
    where: { 
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: startOfMonth }
    },
    _sum: { total: true }
  })

  const lastMonthRevenue = await prisma.order.aggregate({
    where: { 
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
    },
    _sum: { total: true }
  })

  // Valeur totale du catalogue
  const catalogValue = await prisma.artwork.aggregate({
    where: { status: "AVAILABLE" },
    _sum: { price: true }
  })

  return {
    totalArtworks,
    availableArtworks,
    pendingArtworks,
    soldArtworks,
    totalArtists,
    totalUsers,
    totalOrders,
    paidOrders,
    recentOrders,
    recentArtworks,
    newsletterCount,
    totalRevenue: Number(revenue._sum.total) || 0,
    monthlyRevenue: Number(monthlyRevenue._sum.total) || 0,
    lastMonthRevenue: Number(lastMonthRevenue._sum.total) || 0,
    catalogValue: Number(catalogValue._sum.price) || 0
  }
}

function getImageUrl(images: any): string {
  const fallback = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100"
  if (!images) return fallback
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0]?.url || fallback
  } catch {
    return fallback
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  // Calcul variation mensuelle
  const revenueChange = stats.lastMonthRevenue > 0 
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(0)
    : stats.monthlyRevenue > 0 ? "+100" : "0"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light mb-2">Vue d'ensemble</h1>
        <p className="text-neutral-500">
          Statistiques et activité récente de la galerie
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">Chiffre d'affaires total</p>
          <p className="text-3xl font-light">€{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">Ce mois-ci</p>
          <p className="text-3xl font-light">€{stats.monthlyRevenue.toLocaleString()}</p>
          <p className={`text-sm mt-1 ${Number(revenueChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(revenueChange) >= 0 ? '+' : ''}{revenueChange}% vs mois dernier
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">Valeur catalogue</p>
          <p className="text-3xl font-light">€{stats.catalogValue.toLocaleString()}</p>
          <p className="text-neutral-600 text-sm mt-1">{stats.availableArtworks} œuvres</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">Abonnés newsletter</p>
          <p className="text-3xl font-light">{stats.newsletterCount}</p>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/admin/oeuvres" className="bg-neutral-900/30 border border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Œuvres</p>
          <p className="text-2xl font-light">{stats.totalArtworks}</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-green-500">{stats.availableArtworks} dispo</span>
            <span className="text-yellow-500">{stats.pendingArtworks} en attente</span>
          </div>
        </Link>
        <Link href="/admin/artistes" className="bg-neutral-900/30 border border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Artistes</p>
          <p className="text-2xl font-light">{stats.totalArtists}</p>
        </Link>
        <div className="bg-neutral-900/30 border border-neutral-800 p-4">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Utilisateurs</p>
          <p className="text-2xl font-light">{stats.totalUsers}</p>
        </div>
        <Link href="/admin/commandes" className="bg-neutral-900/30 border border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Commandes</p>
          <p className="text-2xl font-light">{stats.totalOrders}</p>
          <p className="text-green-500 text-xs mt-2">{stats.paidOrders} payées</p>
        </Link>
        <div className="bg-neutral-900/30 border border-neutral-800 p-4">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Œuvres vendues</p>
          <p className="text-2xl font-light">{stats.soldArtworks}</p>
        </div>
      </div>

      {/* Actions rapides si œuvres en attente */}
      {stats.pendingArtworks > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">{stats.pendingArtworks} œuvre(s) en attente de validation</p>
              <p className="text-neutral-400 text-sm">Des artistes attendent votre approbation</p>
            </div>
          </div>
          <Link 
            href="/admin/oeuvres?status=PENDING"
            className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 transition-colors"
          >
            Examiner
          </Link>
        </div>
      )}

      {/* Activité récente */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dernières œuvres */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-light">Dernières œuvres ajoutées</h2>
            <Link href="/admin/oeuvres" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Voir tout →
            </Link>
          </div>
          {stats.recentArtworks.length > 0 ? (
            <div className="space-y-4">
              {stats.recentArtworks.map((artwork) => (
                <Link 
                  key={artwork.id}
                  href={`/admin/oeuvres/${artwork.id}`}
                  className="flex items-center gap-4 p-2 -mx-2 rounded hover:bg-neutral-800/50 transition-colors"
                >
                  <img 
                    src={getImageUrl(artwork.images)} 
                    alt={artwork.title}
                    className="w-12 h-12 object-cover bg-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{artwork.title}</p>
                    <p className="text-neutral-500 text-sm">{artwork.artist.user.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 ${
                    artwork.status === "AVAILABLE" ? "bg-green-500/20 text-green-400" :
                    artwork.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-neutral-700 text-neutral-400"
                  }`}>
                    {artwork.status === "AVAILABLE" ? "Dispo" :
                     artwork.status === "PENDING" ? "En attente" : artwork.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">Aucune œuvre ce mois-ci</p>
          )}
        </div>

        {/* Dernières commandes */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-light">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Voir tout →
            </Link>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center gap-4 p-2 -mx-2 rounded"
                >
                  <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {order.user.name?.charAt(0) || order.user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{order.artwork?.title || "Commande"}</p>
                    <p className="text-neutral-500 text-sm">{order.user.name || order.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">€{Number(order.total).toLocaleString()}</p>
                    <span className={`text-xs ${
                      order.status === "PAID" ? "text-green-400" :
                      order.status === "SHIPPED" ? "text-blue-400" :
                      order.status === "DELIVERED" ? "text-purple-400" :
                      "text-neutral-400"
                    }`}>
                      {order.status === "PAID" ? "Payée" :
                       order.status === "SHIPPED" ? "Expédiée" :
                       order.status === "DELIVERED" ? "Livrée" : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">Aucune commande ce mois-ci</p>
          )}
        </div>
      </div>
    </div>
  )
}
