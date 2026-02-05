import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST: Marquer une commande comme livrée
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

    // Vérifier que la commande existe et est expédiée
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    if (order.status !== "SHIPPED") {
      return NextResponse.json({ 
        error: "La commande doit être expédiée pour être marquée comme livrée" 
      }, { status: 400 })
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Commande marquée comme livrée",
      order: updatedOrder
    })

  } catch (error) {
    console.error("Erreur livraison commande:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
