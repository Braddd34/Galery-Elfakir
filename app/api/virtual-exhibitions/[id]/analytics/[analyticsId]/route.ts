import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; analyticsId: string } }
) {
  try {
    const { id: exhibitionId, analyticsId } = params

    const analytics = await prisma.exhibitionAnalytics.findFirst({
      where: {
        id: analyticsId,
        exhibitionId,
      },
    })

    if (!analytics) {
      return NextResponse.json(
        { error: "Session analytics non trouvée" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { duration, artworkClicks, cartAdds, exitedAt } = body

    const data: Record<string, unknown> = {}
    if (duration !== undefined) data.duration = duration
    if (artworkClicks !== undefined) data.artworkClicks = artworkClicks
    if (cartAdds !== undefined) data.cartAdds = cartAdds
    if (exitedAt !== undefined) {
      data.exitedAt = exitedAt ? new Date(exitedAt) : new Date()
    } else {
      data.exitedAt = new Date()
    }

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
