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
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = params
    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id }
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    const body = await request.json()
    const { action } = body

    if (!action || !["publish", "unpublish", "archive"].includes(action)) {
      return NextResponse.json(
        { error: "action doit être publish, unpublish ou archive" },
        { status: 400 }
      )
    }

    let data: { status: string; startDate?: Date; endDate?: Date } = { status: "" }

    if (action === "publish") {
      data = { status: "PUBLISHED" }
      if (!exhibition.startDate) {
        data.startDate = new Date()
      }
    } else if (action === "unpublish") {
      data = { status: "DRAFT" }
    } else if (action === "archive") {
      data = { status: "ARCHIVED", endDate: new Date() }
    }

    const updated = await prisma.virtualExhibition.update({
      where: { id },
      data
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erreur POST publish:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
