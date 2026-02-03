import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500" },
  PROCESSING: { label: "En cours", color: "bg-blue-500" },
  PAID: { label: "Payé", color: "bg-green-500" },
  SHIPPED: { label: "Expédié", color: "bg-purple-500" },
  DELIVERED: { label: "Livré", color: "bg-green-600" },
  CANCELLED: { label: "Annulé", color: "bg-red-500" },
  REFUNDED: { label: "Remboursé", color: "bg-orange-500" },
}

async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })
  return orders
}

async function getOrderStats() {
  const [total, pending, shipped, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true }
    })
  ])
  return { total, pending, shipped, revenue: revenue._sum.total || 0 }
}

export default async function AdminCommandesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [orders, stats] = await Promise.all([
    getAllOrders(),
    getOrderStats()
  ])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Gestion des commandes</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light">{stats.total}</p>
            <p className="text-neutral-500 text-sm mt-1">Total commandes</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light text-yellow-500">{stats.pending}</p>
            <p className="text-neutral-500 text-sm mt-1">En attente</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light text-purple-500">{stats.shipped}</p>
            <p className="text-neutral-500 text-sm mt-1">Expédiées</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-3xl font-light text-green-500">€{Number(stats.revenue).toLocaleString()}</p>
            <p className="text-neutral-500 text-sm mt-1">Revenus</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const snapshot = order.artworkSnapshot as any
              return (
                <div
                  key={order.id}
                  className="bg-neutral-900 border border-neutral-800 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-light">#{order.orderNumber}</p>
                      <p className="text-neutral-500 text-sm">
                        {order.user.name || order.user.email} • {order.createdAt.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs ${statusLabels[order.status].color}`}>
                      {statusLabels[order.status].label}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-neutral-400">{snapshot?.title}</p>
                    <p className="text-lg">€{Number(order.total).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-800">
                    <button className="px-4 py-2 border border-neutral-700 text-sm hover:border-white transition-colors">
                      Voir détails
                    </button>
                    {order.status === "PAID" && (
                      <button className="px-4 py-2 bg-purple-600 text-sm hover:bg-purple-700 transition-colors">
                        Marquer expédié
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-neutral-800">
            <p className="text-neutral-500">Aucune commande pour le moment</p>
          </div>
        )}
      </div>
    </main>
  )
}
