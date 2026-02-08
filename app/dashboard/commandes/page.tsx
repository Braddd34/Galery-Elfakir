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

async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })
  return orders
}

export default async function MesCommandesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const orders = await getUserOrders(session.user.id)

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
        <h1 className="text-3xl font-light mb-8">Mes commandes</h1>

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
                      <p className="text-sm text-neutral-500">Commande #{order.orderNumber}</p>
                      <p className="text-sm text-neutral-600">
                        {order.createdAt.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs ${statusLabels[order.status].color}`}>
                      {statusLabels[order.status].label}
                    </span>
                  </div>

                  <div className="flex gap-6 items-center">
                    {snapshot?.image && (
                      <img
                        src={snapshot.image}
                        alt={snapshot.title}
                        className="w-24 h-24 object-cover bg-neutral-800"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-light">{snapshot?.title || "Œuvre"}</h3>
                      <p className="text-neutral-500 text-sm">{snapshot?.artistName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg">€{Number(order.total).toLocaleString()}</p>
                      {order.trackingNumber && (
                        <p className="text-neutral-500 text-sm mt-1">
                          Suivi: {order.trackingNumber}
                        </p>
                      )}
                      {/* Bouton certificat d'authenticité pour les commandes payées */}
                      {(order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED") && (
                        <a
                          href={`/api/certificate/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-xs bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Certificat d'authenticité
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 border border-neutral-800">
            <p className="text-neutral-500 mb-4">Vous n'avez pas encore de commandes</p>
            <Link href="/catalogue" className="text-white underline hover:text-neutral-300">
              Découvrir le catalogue
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
