import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; analyticsId: string } }
) {
  try {
    const { id: exhibitionId, analyticsId } = params

    const body = await request.json()
    const { sessionId, duration, artworkClicks, cartAdds, exitedAt } = body

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId requis" },
        { status: 400 }
      )
    }

    const analytics = await prisma.exhibitionAnalytics.findFirst({
      where: {
        id: analyticsId,
        exhibitionId,
        sessionId,
      },
    })

    if (!analytics) {
      return NextResponse.json(
        { error: "Session analytics non trouvée" },
        { status: 404 }
      )
    }

    const data: Record<string, unknown> = {}
    if (typeof duration === "number" && duration >= 0) data.duration = duration
    if (typeof artworkClicks === "number" && artworkClicks >= 0) data.artworkClicks = artworkClicks
    if (typeof cartAdds === "number" && cartAdds >= 0) data.cartAdds = cartAdds
    data.exitedAt = exitedAt ? new Date(exitedAt) : new Date()

    await prisma.exhibitionAnalytics.update({
      where: { id: analyticsId },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      "Erreur PUT /api/virtual-exhibitions/[id]/analytics/[analyticsId]:",
      error
    )
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
