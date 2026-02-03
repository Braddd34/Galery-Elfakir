import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET: Récupérer le profil artiste
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const profile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT: Mettre à jour le profil artiste
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const data = await request.json()
    
    const profile = await prisma.artistProfile.update({
      where: { userId: session.user.id },
      data: {
        bio: data.bio,
        country: data.country,
        city: data.city,
        website: data.website,
        instagram: data.instagram,
        phone: data.phone
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
