import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error("Erreur liste newsletter:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 })
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } })
    if (!subscriber) {
      return NextResponse.json({ error: "Abonné non trouvé" }, { status: 404 })
    }

    await prisma.newsletterSubscriber.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression abonné:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
