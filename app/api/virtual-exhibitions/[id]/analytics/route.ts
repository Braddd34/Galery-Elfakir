import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: exhibitionId } = params
    const session = await getServerSession(authOptions)

    const exhibition = await prisma.virtualExhibition.findUnique({
      where: { id: exhibitionId },
    })

    if (!exhibition) {
      return NextResponse.json(
        { error: "Exposition non trouvée" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { sessionId, device, source } = body

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId requis" },
        { status: 400 }
      )
    }

    const validDevices = ["desktop", "mobile", "tablet"]
    if (!device || !validDevices.includes(device)) {
      return NextResponse.json(
        { error: "device doit être desktop, mobile ou tablet" },
        { status: 400 }
      )
    }

    const [analytics, _] = await prisma.$transaction([
      prisma.exhibitionAnalytics.create({
        data: {
          exhibitionId,
          userId: session?.user?.id ?? null,
          sessionId,
          device,
          source: source ?? null,
        },
      }),
      prisma.virtualExhibition.update({
        where: { id: exhibitionId },
        data: { views: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      id: analytics.id,
      sessionId: analytics.sessionId,
      enteredAt: analytics.enteredAt,
    })
  } catch (error) {
    console.error("Erreur POST /api/virtual-exhibitions/[id]/analytics:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
