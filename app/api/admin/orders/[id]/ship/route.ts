import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sendShippingNotificationEmail } from "@/lib/emails"

// POST: Marquer une commande comme expédiée
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { trackingNumber, shippingCarrier } = await request.json()

    // Vérifier que la commande existe et est payée
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    if (order.status !== "PAID" && order.status !== "PROCESSING") {
      return NextResponse.json({ 
        error: "La commande doit être payée pour être expédiée" 
      }, { status: 400 })
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "SHIPPED",
        trackingNumber: trackingNumber || null,
        shippingCarrier: shippingCarrier || null,
        shippedAt: new Date()
      }
    })

    // Envoyer email de notification au client
    const snapshot = order.artworkSnapshot as any
    await sendShippingNotificationEmail(order.user.email, {
      orderNumber: order.orderNumber,
      customerName: order.user.name || "Client",
      artworkTitle: snapshot?.title || "Œuvre",
      artworkArtist: snapshot?.artistName || "Artiste",
      total: Number(order.total),
      trackingNumber: trackingNumber || undefined,
      shippingCarrier: shippingCarrier || undefined
    })

    return NextResponse.json({ 
      success: true,
      message: "Commande marquée comme expédiée",
      order: updatedOrder
    })

  } catch (error) {
    console.error("Erreur expédition commande:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
