import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const VALID_ACTIONS = ["add", "remove", "checkout"]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { artworkId, action, sessionId } = body

    if (!artworkId || !action) {
      return NextResponse.json(
        { error: "artworkId et action sont requis" },
        { status: 400 }
      )
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Valeurs acceptées : add, remove, checkout" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "sessionId requis pour les utilisateurs non connectés" },
        { status: 400 }
      )
    }

    await prisma.cartEvent.create({
      data: {
        artworkId,
        action,
        userId,
        sessionId: sessionId || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur cart event:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
