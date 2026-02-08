import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - Récupérer les messages de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "received" // received | sent | all
    
    let where: any = {}
    
    if (type === "received") {
      where = { receiverId: session.user.id }
    } else if (type === "sent") {
      where = { senderId: session.user.id }
    } else {
      where = {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      }
    }
    
    const messages = await prisma.message.findMany({
      where,
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
      },
      orderBy: { createdAt: "desc" }
    })
    
    // Compter les non lus
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        read: false
      }
    })
    
    return NextResponse.json({
      messages,
      unreadCount
    })
  } catch (error) {
    console.error("Erreur récupération messages:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Envoyer un message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const { receiverId, subject, content, artworkId } = await req.json()
    
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Destinataire et contenu requis" },
        { status: 400 }
      )
    }
    
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous envoyer un message" },
        { status: 400 }
      )
    }
    
    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })
    
    if (!receiver) {
      return NextResponse.json(
        { error: "Destinataire introuvable" },
        { status: 404 }
      )
    }
    
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        subject: subject || null,
        content,
        artworkId: artworkId || null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
    
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Erreur envoi message:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
