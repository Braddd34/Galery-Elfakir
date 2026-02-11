import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { changePasswordSchema } from "@/lib/validations"
import { authLimiter, getClientIP } from "@/lib/rate-limit"

/**
 * POST /api/user/change-password
 * Permet à un utilisateur connecté de changer son mot de passe.
 * Protégé par rate limiting pour éviter le brute force sur le mot de passe actuel.
 */
export async function POST(req: Request) {
  try {
    // Rate limiting — max 5 tentatives par minute
    const ip = getClientIP(req)
    const rateLimitResult = await authLimiter.check(ip, 5)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validation Zod
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      )
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien" },
        { status: 400 }
      )
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    })
  } catch (error) {
    console.error("Erreur changement mot de passe:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
