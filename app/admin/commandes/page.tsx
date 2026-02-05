import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import OrdersList from "@/components/admin/OrdersList"

async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })
  // Sérialiser les dates pour le composant client
  return orders.map(order => ({
    ...order,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
  }))
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
        <OrdersList orders={orders as any} />
      </div>
    </main>
  )
}
