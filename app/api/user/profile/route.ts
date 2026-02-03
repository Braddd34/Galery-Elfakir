import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
    
    // Créer ou mettre à jour le profil
    const profile = await prisma.buyerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone
      },
      create: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
