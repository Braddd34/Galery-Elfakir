import prisma from "@/lib/prisma"
import Link from "next/link"
import { getArtworkImageUrl } from "@/lib/image-utils"

function getImageUrl(images: unknown): string {
  return getArtworkImageUrl(images)
}

async function getAbandonStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalAdds, totalCheckouts, totalRemoves] = await Promise.all([
    prisma.cartEvent.count({
      where: { action: "add", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.cartEvent.count({
      where: { action: "checkout", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.cartEvent.count({
      where: { action: "remove", createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  const abandonmentRate =
    totalAdds > 0
      ? Math.round(((totalAdds - totalCheckouts) / totalAdds) * 100)
      : 0

  const conversionRate = totalAdds > 0 ? Math.round((totalCheckouts / totalAdds) * 100) : 0

  // Top œuvres abandonnées
  const addsByArtwork = await prisma.cartEvent.groupBy({
    by: ["artworkId"],
    where: { action: "add", createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  })

  const checkoutsByArtwork = await prisma.cartEvent.groupBy({
    by: ["artworkId"],
    where: { action: "checkout", createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
  })

  const checkoutsMap = new Map(
    checkoutsByArtwork.map((c) => [c.artworkId, c._count.id])
  )

  const abandonedArtworkData = addsByArtwork
    .map((a) => ({
      artworkId: a.artworkId,
      adds: a._count.id,
      checkouts: checkoutsMap.get(a.artworkId) || 0,
    }))
    .filter((a) => a.adds > a.checkouts)
    .sort((a, b) => (b.adds - b.checkouts) - (a.adds - a.checkouts))
    .slice(0, 10)

  const artworkDetails = await prisma.artwork.findMany({
    where: { id: { in: abandonedArtworkData.map((a) => a.artworkId) } },
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
      price: true,
      artist: {
        select: { user: { select: { name: true } } },
      },
    },
  })

  const artworkMap = new Map(artworkDetails.map((a) => [a.id, a]))

  const topAbandoned = abandonedArtworkData.map((a) => {
    const artwork = artworkMap.get(a.artworkId)
    return {
      artworkId: a.artworkId,
      title: artwork?.title || "Œuvre supprimée",
      slug: artwork?.slug || "",
      image: getImageUrl(artwork?.images),
      price: artwork ? Number(artwork.price) : 0,
      artistName: artwork?.artist?.user?.name || "Inconnu",
      adds: a.adds,
      checkouts: a.checkouts,
      abandonRate: a.adds > 0 ? Math.round(((a.adds - a.checkouts) / a.adds) * 100) : 0,
    }
  })

  // Paniers abandonnés récents (7 jours)
  const recentAdds = await prisma.cartEvent.findMany({
    where: { action: "add", createdAt: { gte: sevenDaysAgo } },
    select: {
      userId: true,
      sessionId: true,
      artworkId: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      artwork: {
        select: { title: true, slug: true, images: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const recentCheckoutKeys = new Set(
    (
      await prisma.cartEvent.findMany({
        where: { action: "checkout", createdAt: { gte: sevenDaysAgo } },
        select: { userId: true, sessionId: true, artworkId: true },
      })
    ).map((c) => `${c.userId || c.sessionId}-${c.artworkId}`)
  )

  const abandonedCartsMap = new Map<
    string,
    {
      userName: string | null
      userEmail: string | null
      isAnonymous: boolean
      items: {
        title: string
        slug: string
        image: string
        price: number
        addedAt: Date
      }[]
      lastActivity: Date
    }
  >()

  for (const add of recentAdds) {
    const key = `${add.userId || add.sessionId}-${add.artworkId}`
    if (recentCheckoutKeys.has(key)) continue

    const groupKey = add.userId || add.sessionId || "unknown"

    if (!abandonedCartsMap.has(groupKey)) {
      abandonedCartsMap.set(groupKey, {
        userName: add.user?.name || null,
        userEmail: add.user?.email || null,
        isAnonymous: !add.userId,
        items: [],
        lastActivity: add.createdAt,
      })
    }

    const cart = abandonedCartsMap.get(groupKey)!
    if (!cart.items.some((i) => i.slug === (add.artwork?.slug || add.artworkId))) {
      cart.items.push({
        title: add.artwork?.title || "Œuvre supprimée",
        slug: add.artwork?.slug || "",
        image: getImageUrl(add.artwork?.images),
        price: add.artwork ? Number(add.artwork.price) : 0,
        addedAt: add.createdAt,
      })
    }
  }

  const recentAbandonedCarts = Array.from(abandonedCartsMap.values())
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
    .slice(0, 15)

  return {
    totalAdds,
    totalCheckouts,
    totalRemoves,
    abandonmentRate,
    conversionRate,
    topAbandoned,
    recentAbandonedCarts,
  }
}

export default async function AbandonStatsPage() {
  const stats = await getAbandonStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="text-neutral-500 hover:text-white transition-colors text-sm"
            >
              ← Vue d&apos;ensemble
            </Link>
          </div>
          <h1 className="text-3xl font-light">Paniers abandonnés</h1>
          <p className="text-neutral-500 mt-1">
            Analyse des 30 derniers jours
          </p>
        </div>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            Taux d&apos;abandon
          </p>
          <p
            className={`text-4xl font-light ${
              stats.abandonmentRate > 70
                ? "text-red-400"
                : stats.abandonmentRate > 40
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {stats.abandonmentRate}%
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            Taux de conversion
          </p>
          <p className="text-4xl font-light text-green-400">
            {stats.conversionRate}%
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            Ajouts au panier
          </p>
          <p className="text-4xl font-light">{stats.totalAdds}</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            Checkouts
          </p>
          <p className="text-4xl font-light">{stats.totalCheckouts}</p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 p-6">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            Retraits
          </p>
          <p className="text-4xl font-light">{stats.totalRemoves}</p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6">
        <p className="text-neutral-500 text-sm mb-3">Entonnoir de conversion</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-400">Ajouts au panier</span>
              <span>{stats.totalAdds}</span>
            </div>
            <div className="w-full bg-neutral-800 h-3 rounded-full">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-400">Checkouts</span>
              <span>{stats.totalCheckouts}</span>
            </div>
            <div className="w-full bg-neutral-800 h-3 rounded-full">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.totalAdds > 0 ? (stats.totalCheckouts / stats.totalAdds) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-400">Abandonnés</span>
              <span>{stats.totalAdds - stats.totalCheckouts}</span>
            </div>
            <div className="w-full bg-neutral-800 h-3 rounded-full">
              <div
                className="bg-red-500 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.abandonmentRate}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top abandoned artworks */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-6">
          <h2 className="text-lg font-light mb-6">
            Œuvres les plus abandonnées
          </h2>
          {stats.topAbandoned.length > 0 ? (
            <div className="space-y-4">
              {stats.topAbandoned.map((artwork, index) => (
                <div
                  key={artwork.artworkId}
                  className="flex items-center gap-4 p-3 -mx-3 rounded hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="text-neutral-600 text-sm w-5 text-right">
                    {index + 1}
                  </span>
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-12 h-12 object-cover bg-neutral-800 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate text-sm">{artwork.title}</p>
                    <p className="text-neutral-500 text-xs">{artwork.artistName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-blue-400">{artwork.adds} ajouts</span>
                      <span className="text-neutral-600">→</span>
                      <span className="text-green-400">{artwork.checkouts} checkouts</span>
                    </div>
                    <p className="text-red-400 text-xs mt-0.5">
                      {artwork.abandonRate}% d&apos;abandon
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">
              Aucune donnée pour cette période
            </p>
          )}
        </div>

        {/* Recent abandoned carts */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-6">
          <h2 className="text-lg font-light mb-6">
            Paniers abandonnés récents
            <span className="text-neutral-500 text-sm font-normal ml-2">
              (7 derniers jours)
            </span>
          </h2>
          {stats.recentAbandonedCarts.length > 0 ? (
            <div className="space-y-4">
              {stats.recentAbandonedCarts.map((cart, index) => (
                <div
                  key={index}
                  className="p-3 -mx-3 rounded border border-transparent hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center shrink-0">
                      {cart.isAnonymous ? (
                        <svg
                          className="w-4 h-4 text-neutral-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">
                          {(cart.userName || cart.userEmail || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">
                        {cart.isAnonymous
                          ? "Visiteur anonyme"
                          : cart.userName || cart.userEmail}
                      </p>
                      {!cart.isAnonymous && cart.userEmail && cart.userName && (
                        <p className="text-xs text-neutral-500 truncate">
                          {cart.userEmail}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-neutral-600 shrink-0">
                      {cart.items.length} article{cart.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="ml-11 space-y-1">
                    {cart.items.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-6 h-6 object-cover bg-neutral-800 rounded"
                        />
                        <span className="text-neutral-400 truncate flex-1">
                          {item.title}
                        </span>
                        <span className="text-neutral-500 shrink-0">
                          €{item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {cart.items.length > 3 && (
                      <p className="text-xs text-neutral-600">
                        +{cart.items.length - 3} autre
                        {cart.items.length - 3 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">
              Aucun panier abandonné cette semaine
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
