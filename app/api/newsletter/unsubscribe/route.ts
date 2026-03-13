import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

const SECRET = process.env.NEXTAUTH_SECRET || ""

/**
 * Verifie le token HMAC pour securiser la desinscription.
 */
function verifyToken(email: string, token: string): boolean {
  if (!SECRET) return false
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(email.toLowerCase())
    .digest("hex")
  return token === expected
}

/**
 * POST /api/newsletter/unsubscribe
 * Desactive l'abonnement newsletter pour l'email donne.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    if (!verifyToken(email, token)) {
      return NextResponse.json({ error: "Lien de désinscription invalide" }, { status: 403 })
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!subscriber) {
      return NextResponse.json({ error: "Email non trouvé" }, { status: 404 })
    }

    if (!subscriber.active) {
      return NextResponse.json({ success: true, message: "Déjà désinscrit" })
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { active: false }
    })

    return NextResponse.json({ success: true, message: "Désinscription confirmée" })
  } catch (error) {
    console.error("Erreur désinscription newsletter:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
