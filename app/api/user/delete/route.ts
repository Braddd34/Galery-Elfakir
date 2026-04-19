import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { formLimiter, getClientIP } from "@/lib/rate-limit"

/**
 * DELETE /api/user/delete
 *
 * Suppression / anonymisation du compte (RGPD - droit à l'effacement).
 *
 * Stratégie :
 * - Si l'utilisateur a des commandes : anonymisation (obligation légale de
 *   conservation comptable des factures pendant 10 ans en France).
 * - Sinon : suppression complète (les relations CASCADE nettoient le reste).
 *
 * Refuse :
 * - Les comptes ADMIN (sécurité).
 * - Les comptes ARTIST qui ont encore des œuvres publiées (à gérer manuellement
 *   pour ne pas casser les liens publics et avis existants).
 *
 * Demande la confirmation par mot de passe (si l'utilisateur en a un).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ip = getClientIP(req)
    const limited = await formLimiter.check(`delete-account:${ip}`, 3)
    if (!limited.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      )
    }

    const userId = session.user.id

    let body: { password?: string; confirm?: string } = {}
    try {
      body = await req.json()
    } catch {}

    if (body.confirm !== "SUPPRIMER") {
      return NextResponse.json(
        { error: "Confirmation manquante" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artistProfile: { include: { _count: { select: { artworks: true } } } },
        _count: { select: { orders: true } },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      )
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Un compte administrateur ne peut pas être supprimé via cette API.",
        },
        { status: 403 }
      )
    }

    if (user.password && body.password) {
      const ok = await bcrypt.compare(body.password, user.password)
      if (!ok) {
        return NextResponse.json(
          { error: "Mot de passe incorrect" },
          { status: 401 }
        )
      }
    } else if (user.password && !body.password) {
      return NextResponse.json(
        { error: "Mot de passe requis" },
        { status: 400 }
      )
    }

    if (
      user.role === "ARTIST" &&
      user.artistProfile?._count.artworks &&
      user.artistProfile._count.artworks > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Vous avez encore des œuvres en ligne. Contactez la galerie pour les retirer avant la suppression du compte.",
        },
        { status: 409 }
      )
    }

    if (user._count.orders > 0) {
      const anonEmail = `deleted-${userId}@deleted.local`
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: "Compte supprimé",
          email: anonEmail,
          password: null,
          image: null,
          emailVerified: null,
        },
      })
      await prisma.buyerProfile.deleteMany({ where: { userId } })

      return NextResponse.json({
        success: true,
        type: "anonymized",
        message:
          "Votre compte a été anonymisé. Vos commandes sont conservées pour des raisons comptables.",
      })
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({
      success: true,
      type: "deleted",
      message: "Votre compte a été supprimé.",
    })
  } catch (error) {
    console.error("Erreur suppression compte:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
