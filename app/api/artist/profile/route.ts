import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { artistProfileSchema } from "@/lib/validations"
import { sanitize } from "@/lib/sanitize"

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

    // Validation Zod — vérifie les types et formats (URL, téléphone, longueurs)
    const validation = artistProfileSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const valid = validation.data
    
    // Sanitize — nettoie les entrées texte contre le XSS
    const profile = await prisma.artistProfile.update({
      where: { userId: session.user.id },
      data: {
        bio: valid.bio ? sanitize(valid.bio) : valid.bio,
        country: valid.country ? sanitize(valid.country) : valid.country,
        city: valid.city ? sanitize(valid.city) : valid.city,
        website: valid.website || null,
        instagram: valid.instagram || null,
        phone: valid.phone || null
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
