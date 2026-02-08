import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - Récupérer un message et le marquer comme lu
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const message = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true
          }
        }
      }
    })
    
    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      )
    }
    
    // Vérifier que l'utilisateur est impliqué dans le message
    if (message.senderId !== session.user.id && message.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }
    
    // Marquer comme lu si c'est le destinataire
    if (message.receiverId === session.user.id && !message.read) {
      await prisma.message.update({
        where: { id: params.id },
        data: {
          read: true,
          readAt: new Date()
        }
      })
    }
    
    return NextResponse.json(message)
  } catch (error) {
    console.error("Erreur récupération message:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un message
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const message = await prisma.message.findUnique({
      where: { id: params.id }
    })
    
    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      )
    }
    
    // Seul l'expéditeur ou le destinataire peut supprimer
    if (message.senderId !== session.user.id && message.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }
    
    await prisma.message.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression message:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
