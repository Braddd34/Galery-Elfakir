import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * API pour gérer les paramètres globaux de la galerie.
 * Utilise la table Settings avec des clés uniques pour chaque paramètre.
 * Seul l'admin peut lire et modifier ces paramètres.
 */

// GET : Récupérer tous les paramètres
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const settings = await prisma.setting.findMany()
    
    // Convertir en objet clé-valeur
    const result: Record<string, any> = {}
    settings.forEach(s => {
      result[s.key] = s.value
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur récupération paramètres:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT : Mettre à jour les paramètres
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const data = await req.json()

    // Sauvegarder chaque paramètre individuellement (upsert)
    const keys = Object.keys(data)
    for (const key of keys) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: data[key] },
        create: { key, value: data[key] }
      })
    }

    return NextResponse.json({ success: true, message: "Paramètres enregistrés" })
  } catch (error) {
    console.error("Erreur sauvegarde paramètres:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
