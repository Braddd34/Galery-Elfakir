import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const artists = await prisma.artistProfile.findMany({
      where: {
        user: {
          status: "ACTIVE"
        }
      },
      select: {
        id: true,
        userId: true,
        bio: true,
        country: true,
        city: true,
        website: true,
        instagram: true,
        phone: true,
        twitter: true,
        facebook: true,
        linkedin: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    })

    return NextResponse.json({ artists })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
