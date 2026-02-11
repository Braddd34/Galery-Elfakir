import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { buyerProfileSchema } from "@/lib/validations"
import { sanitize } from "@/lib/sanitize"

// GET: Récupérer le profil acheteur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT: Mettre à jour le profil acheteur
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const data = await request.json()

    // Validation Zod — vérifie les formats (code postal, téléphone, longueurs)
    const validation = buyerProfileSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const valid = validation.data

    // Sanitize les champs texte contre le XSS
    const sanitizedData = {
      firstName: valid.firstName ? sanitize(valid.firstName) : valid.firstName,
      lastName: valid.lastName ? sanitize(valid.lastName) : valid.lastName,
      address: valid.address ? sanitize(valid.address) : valid.address,
      city: valid.city ? sanitize(valid.city) : valid.city,
      postalCode: valid.postalCode || null,
      country: valid.country ? sanitize(valid.country) : valid.country,
      phone: valid.phone || null
    }
    
    // Créer ou mettre à jour le profil
    const profile = await prisma.buyerProfile.upsert({
      where: { userId: session.user.id },
      update: sanitizedData,
      create: {
        userId: session.user.id,
        ...sanitizedData
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
