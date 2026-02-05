"use client"

import { useState } from "react"
import { OrderStatus } from "@prisma/client"

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: any
  trackingNumber: string | null
  shippingCarrier: string | null
  shippedAt: Date | null
  deliveredAt: Date | null
  createdAt: Date
  artworkSnapshot: any
  shippingAddress: any
  user: {
    name: string | null
    email: string
  }
}

interface OrdersListProps {
  orders: Order[]
}

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500" },
  PROCESSING: { label: "En cours", color: "bg-blue-500" },
  PAID: { label: "Payé", color: "bg-green-500" },
  SHIPPED: { label: "Expédié", color: "bg-purple-500" },
  DELIVERED: { label: "Livré", color: "bg-green-600" },
  CANCELLED: { label: "Annulé", color: "bg-red-500" },
  REFUNDED: { label: "Remboursé", color: "bg-orange-500" },
}

const carriers = [
  { value: "colissimo", label: "Colissimo" },
  { value: "chronopost", label: "Chronopost" },
  { value: "dhl", label: "DHL" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "mondial_relay", label: "Mondial Relay" },
  { value: "other", label: "Autre" },
]

export default function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showShipModal, setShowShipModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingCarrier, setShippingCarrier] = useState("")

  const handleShip = async () => {
    if (!selectedOrder) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, shippingCarrier })
      })

      if (res.ok) {
        // Mettre à jour la liste localement
        setOrders(orders.map(o => 
          o.id === selectedOrder.id 
            ? { ...o, status: "SHIPPED" as OrderStatus, trackingNumber, shippingCarrier, shippedAt: new Date() }
            : o
        ))
        setShowShipModal(false)
        setTrackingNumber("")
        setShippingCarrier("")
        alert("Commande marquée comme expédiée !")
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de l'expédition")
      }
    } catch (error) {
      alert("Erreur lors de l'expédition")
    } finally {
      setLoading(false)
    }
  }

  const handleDeliver = async (order: Order) => {
    if (!confirm("Confirmer la livraison de cette commande ?")) return
    
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/deliver`, {
        method: "POST"
      })

      if (res.ok) {
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { ...o, status: "DELIVERED" as OrderStatus, deliveredAt: new Date() }
            : o
        ))
        alert("Commande marquée comme livrée !")
      } else {
        const data = await res.json()
        alert(data.error || "Erreur")
      }
    } catch (error) {
      alert("Erreur")
    }
  }

  const openShipModal = (order: Order) => {
    setSelectedOrder(order)
    setShowShipModal(true)
  }

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  return (
    <>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const snapshot = order.artworkSnapshot as any
            const address = order.shippingAddress as any
            
            return (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-light text-lg">#{order.orderNumber}</p>
                    <p className="text-neutral-500 text-sm">
                      {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs text-white ${statusLabels[order.status].color}`}>
                    {statusLabels[order.status].label}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">{snapshot?.title}</p>
                    <p className="text-neutral-500 text-sm">par {snapshot?.artistName}</p>
                  </div>
                  <p className="text-xl">€{Number(order.total).toLocaleString()}</p>
                </div>

                {/* Infos livraison si expédié */}
                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-neutral-800 text-sm">
                    <p className="text-neutral-400">
                      <span className="text-white">Transporteur :</span> {order.shippingCarrier || "Non spécifié"}
                    </p>
                    <p className="text-neutral-400">
                      <span className="text-white">N° suivi :</span> {order.trackingNumber}
                    </p>
                    {order.shippedAt && (
                      <p className="text-neutral-400">
                        <span className="text-white">Expédié le :</span> {new Date(order.shippedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-800">
                  <button 
                    onClick={() => openDetailsModal(order)}
                    className="px-4 py-2 border border-neutral-700 text-sm hover:border-white transition-colors"
                  >
                    Voir détails
                  </button>
                  
                  {order.status === "PAID" && (
                    <button 
                      onClick={() => openShipModal(order)}
                      className="px-4 py-2 bg-purple-600 text-sm hover:bg-purple-700 transition-colors"
                    >
                      Marquer expédié
                    </button>
                  )}
                  
                  {order.status === "SHIPPED" && (
                    <button 
                      onClick={() => handleDeliver(order)}
                      className="px-4 py-2 bg-green-600 text-sm hover:bg-green-700 transition-colors"
                    >
                      Marquer livré
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

      {/* Modal Expédition */}
      {showShipModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 p-6 max-w-md w-full">
            <h2 className="text-xl font-light mb-6">Marquer comme expédié</h2>
            
            <p className="text-neutral-400 mb-6">
              Commande #{selectedOrder.orderNumber}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Transporteur
                </label>
                <select
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:border-white focus:outline-none"
                >
                  <option value="">Sélectionner un transporteur</option>
                  {carriers.map((carrier) => (
                    <option key={carrier.value} value={carrier.value}>
                      {carrier.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Numéro de suivi
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ex: 1Z999AA10123456784"
                  className="w-full bg-black border border-neutral-700 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowShipModal(false)}
                className="flex-1 px-4 py-3 border border-neutral-700 text-sm hover:border-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleShip}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-purple-600 text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "En cours..." : "Confirmer l'expédition"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-light">Détails de la commande</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Infos commande */}
              <div>
                <p className="text-sm text-neutral-500 mb-1">Numéro de commande</p>
                <p className="text-lg">#{selectedOrder.orderNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 text-xs text-white ${statusLabels[selectedOrder.status].color}`}>
                    {statusLabels[selectedOrder.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Date</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Client */}
              <div className="pt-4 border-t border-neutral-800">
                <p className="text-sm text-neutral-500 mb-2">Client</p>
                <p>{selectedOrder.user.name || "Non renseigné"}</p>
                <p className="text-neutral-400">{selectedOrder.user.email}</p>
              </div>

              {/* Œuvre */}
              <div className="pt-4 border-t border-neutral-800">
                <p className="text-sm text-neutral-500 mb-2">Œuvre</p>
                <p className="text-lg">{(selectedOrder.artworkSnapshot as any)?.title}</p>
                <p className="text-neutral-400">par {(selectedOrder.artworkSnapshot as any)?.artistName}</p>
                <p className="text-xl mt-2">€{Number(selectedOrder.total).toLocaleString()}</p>
              </div>

              {/* Adresse de livraison */}
              {selectedOrder.shippingAddress && (
                <div className="pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-500 mb-2">Adresse de livraison</p>
                  <div className="text-neutral-300">
                    <p>{(selectedOrder.shippingAddress as any)?.firstName} {(selectedOrder.shippingAddress as any)?.lastName}</p>
                    <p>{(selectedOrder.shippingAddress as any)?.address}</p>
                    <p>{(selectedOrder.shippingAddress as any)?.postalCode} {(selectedOrder.shippingAddress as any)?.city}</p>
                    <p>{(selectedOrder.shippingAddress as any)?.country}</p>
                  </div>
                </div>
              )}

              {/* Infos livraison */}
              {selectedOrder.trackingNumber && (
                <div className="pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-500 mb-2">Informations de livraison</p>
                  <p><span className="text-neutral-500">Transporteur :</span> {selectedOrder.shippingCarrier}</p>
                  <p><span className="text-neutral-500">N° suivi :</span> {selectedOrder.trackingNumber}</p>
                  {selectedOrder.shippedAt && (
                    <p><span className="text-neutral-500">Expédié le :</span> {new Date(selectedOrder.shippedAt).toLocaleDateString('fr-FR')}</p>
                  )}
                  {selectedOrder.deliveredAt && (
                    <p><span className="text-neutral-500">Livré le :</span> {new Date(selectedOrder.deliveredAt).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-8 px-4 py-3 border border-neutral-700 text-sm hover:border-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
