import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendWelcomeEmail, sendEmailVerificationEmail } from "@/lib/emails"
import { authLimiter, getClientIP } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting : max 5 inscriptions par minute par IP
    const ip = getClientIP(request)
    const { success } = await authLimiter.check(ip, 5)
    if (!success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans une minute." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password, name, role } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Validation nom
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Le nom doit contenir entre 2 et 100 caractères" },
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

    // Créer l'utilisateur (email non vérifié)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        status: userStatus,
        emailVerified: null, // L'email doit être vérifié
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

    // Créer un token de vérification d'email
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 3600000) // 24 heures

    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token: verificationToken,
        expires
      }
    })

    // Construire l'URL de vérification
    const baseUrl = process.env.NEXTAUTH_URL || "https://galeryelfakir.vercel.app"
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    // Envoyer email de vérification (en arrière-plan, sans bloquer)
    sendEmailVerificationEmail(user.email, user.name || "", verifyUrl).catch(err => {
      console.error("Erreur envoi email vérification:", err)
    })

    // Envoyer aussi l'email de bienvenue
    sendWelcomeEmail(user.email, user.name || "").catch(err => {
      console.error("Erreur envoi email bienvenue:", err)
    })

    return NextResponse.json({
      message: userRole === "ARTIST" 
        ? "Compte créé ! Vérifiez votre email et attendez la validation de votre profil artiste."
        : "Compte créé ! Vérifiez votre email pour activer votre compte.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      requiresVerification: true
    })

  } catch (error) {
    console.error("Erreur inscription:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    )
  }
}
