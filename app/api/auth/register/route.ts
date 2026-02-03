import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Déterminer le rôle et le statut
    const userRole = role === "ARTIST" ? "ARTIST" : "BUYER"
    const userStatus = role === "ARTIST" ? "PENDING" : "ACTIVE" // Les artistes doivent être validés

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        status: userStatus,
        emailVerified: new Date(), // Pour simplifier, on vérifie directement
      }
    })

    // Créer le profil selon le rôle
    if (userRole === "ARTIST") {
      await prisma.artistProfile.create({
        data: {
          userId: user.id,
        }
      })
    } else {
      await prisma.buyerProfile.create({
        data: {
          userId: user.id,
        }
      })
    }

    return NextResponse.json({
      message: userRole === "ARTIST" 
        ? "Compte créé ! Votre profil artiste est en attente de validation."
        : "Compte créé avec succès !",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error("Erreur inscription:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    )
  }
}
