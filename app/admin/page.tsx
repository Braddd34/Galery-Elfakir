import prisma from "@/lib/prisma"
import Link from "next/link"
import { getServerTranslation } from "@/lib/i18n-server"
import { getArtworkImageUrl } from "@/lib/image-utils"

async function getCartAbandonStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalAdds, totalCheckouts] = await Promise.all([
    prisma.cartEvent.count({
      where: { action: "add", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.cartEvent.count({
      where: { action: "checkout", createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  const abandonmentRate =
    totalAdds > 0
      ? Math.round(((totalAdds - totalCheckouts) / totalAdds) * 100)
      : 0

  // Nombre de paniers uniques abandonnés (7 jours)
  const recentAddUsers = await prisma.cartEvent.findMany({
    where: { action: "add", createdAt: { gte: sevenDaysAgo } },
    select: { userId: true, sessionId: true },
    distinct: ["userId", "sessionId"],
  })

  const recentCheckoutUsers = await prisma.cartEvent.findMany({
    where: { action: "checkout", createdAt: { gte: sevenDaysAgo } },
    select: { userId: true, sessionId: true },
    distinct: ["userId", "sessionId"],
  })

  const checkoutKeys = new Set(
    recentCheckoutUsers.map((c) => c.userId || c.sessionId)
  )

  const abandonedCount = recentAddUsers.filter(
    (a) => !checkoutKeys.has(a.userId || a.sessionId)
  ).length

  return { abandonmentRate, abandonedCount, totalAdds }
}

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

export default async function AdminDashboard() {
  const t = getServerTranslation()
  const [stats, cartStats] = await Promise.all([getStats(), getCartAbandonStats()])

  // Calcul variation mensuelle
  const revenueChange = stats.lastMonthRevenue > 0 
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(0)
    : stats.monthlyRevenue > 0 ? "+100" : "0"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light mb-2">{t("adminDash.overview")}</h1>
        <p className="text-neutral-500">
          {t("adminDash.overviewDesc")}
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">{t("adminDash.totalRevenue")}</p>
          <p className="text-3xl font-light">€{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">{t("adminDash.thisMonth")}</p>
          <p className="text-3xl font-light">€{stats.monthlyRevenue.toLocaleString()}</p>
          <p className={`text-sm mt-1 ${Number(revenueChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(revenueChange) >= 0 ? '+' : ''}{revenueChange}% {t("adminDash.vsLastMonth")}
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">{t("adminDash.catalogValue")}</p>
          <p className="text-3xl font-light">€{stats.catalogValue.toLocaleString()}</p>
          <p className="text-neutral-600 text-sm mt-1">{stats.availableArtworks} {t("adminDash.artworks").toLowerCase()}</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-sm mb-1">{t("adminDash.newsletterSubs")}</p>
          <p className="text-3xl font-light">{stats.newsletterCount}</p>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/admin/oeuvres" className="bg-neutral-900/30 border border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{t("adminDash.artworks")}</p>
          <p className="text-2xl font-light">{stats.totalArtworks}</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-green-500">{stats.availableArtworks} {t("adminDash.available")}</span>
            <span className="text-yellow-500">{stats.pendingArtworks} {t("adminDash.pending")}</span>
          </div>
        </Link>
        <Link href="/admin/artistes" className="bg-neutral-900/30 border border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{t("adminDash.artists")}</p>
          <p className="text-2xl font-light">{stats.totalArtists}</p>
        </Link>
        <div className="bg-neutral-900/30 border border-neutral-800 p-4">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{t("adminDash.users")}</p>
          <p className="text-2xl font-light">{stats.totalUsers}</p>
        </div>
        <Link href="/admin/commandes" className="bg-neutral-900/30 border border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{t("adminDash.orders")}</p>
          <p className="text-2xl font-light">{stats.totalOrders}</p>
          <p className="text-green-500 text-xs mt-2">{stats.paidOrders} {t("adminDash.paid")}</p>
        </Link>
        <div className="bg-neutral-900/30 border border-neutral-800 p-4">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{t("adminDash.soldArtworks")}</p>
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
              <p className="text-white font-medium">{stats.pendingArtworks} {t("adminDash.pendingValidation")}</p>
              <p className="text-neutral-400 text-sm">{t("adminDash.artistsWaiting")}</p>
            </div>
          </div>
          <Link 
            href="/admin/oeuvres?status=PENDING"
            className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 transition-colors"
          >
            {t("adminDash.review")}
          </Link>
        </div>
      )}

      {/* Statistiques paniers abandonnés */}
      <Link href="/admin/stats/abandons" className="block bg-neutral-900/30 border border-neutral-800 p-6 hover:border-red-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-light">Paniers abandonnés</h2>
          </div>
          <span className="text-neutral-500 text-sm group-hover:text-white transition-colors">
            Voir détails →
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Taux d&apos;abandon</p>
            <p className={`text-2xl font-light ${cartStats.abandonmentRate > 70 ? "text-red-400" : cartStats.abandonmentRate > 40 ? "text-yellow-400" : "text-green-400"}`}>
              {cartStats.abandonmentRate}%
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Abandons (7j)</p>
            <p className="text-2xl font-light">{cartStats.abandonedCount}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Ajouts (30j)</p>
            <p className="text-2xl font-light">{cartStats.totalAdds}</p>
          </div>
        </div>
      </Link>

      {/* Activité récente */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dernières œuvres */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-light">{t("adminDash.recentArtworks")}</h2>
            <Link href="/admin/oeuvres" className="text-sm text-neutral-400 hover:text-white transition-colors">
              {t("adminDash.viewAll")}
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
                    src={getArtworkImageUrl(artwork.images)} 
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
                    {artwork.status === "AVAILABLE" ? t("adminDash.statusAvailable") :
                     artwork.status === "PENDING" ? t("adminDash.statusPending") : artwork.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">{t("adminDash.noArtworksMonth")}</p>
          )}
        </div>

        {/* Dernières commandes */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-light">{t("adminDash.recentOrders")}</h2>
            <Link href="/admin/commandes" className="text-sm text-neutral-400 hover:text-white transition-colors">
              {t("adminDash.viewAll")}
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
                    <p className="text-white truncate">{order.artwork?.title || t("adminDash.orders")}</p>
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
                      {order.status === "PAID" ? t("adminDash.statusPaid") :
                       order.status === "SHIPPED" ? t("adminDash.statusShipped") :
                       order.status === "DELIVERED" ? t("adminDash.statusDelivered") : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">{t("adminDash.noOrdersMonth")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
