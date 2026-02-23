import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { isVIP } = await request.json()

    if (typeof isVIP !== "boolean") {
      return NextResponse.json({ error: "isVIP doit être un booléen" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isVIP },
      select: { id: true, name: true, email: true, isVIP: true }
    })

    return NextResponse.json({
      success: true,
      user,
      message: isVIP ? "Utilisateur marqué VIP" : "Statut VIP retiré"
    })
  } catch (error) {
    console.error("Erreur mise à jour VIP:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
