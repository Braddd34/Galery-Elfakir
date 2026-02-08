import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * API CRUD pour gérer les expositions d'un artiste.
 * GET : récupère toutes les expositions de l'artiste connecté
 * POST : crée une nouvelle exposition
 * DELETE : supprime une exposition par son ID (query param)
 */

// GET : Récupérer les expositions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    const exhibitions = await prisma.exhibition.findMany({
      where: { artistId: artistProfile.id },
      orderBy: { startDate: "desc" }
    })

    return NextResponse.json(exhibitions)
  } catch (error) {
    console.error("Erreur récupération expositions:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST : Créer une exposition
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    const data = await req.json()
    const { title, description, location, city, country, startDate, endDate, imageUrl, link } = data

    if (!title || !location || !startDate) {
      return NextResponse.json({ error: "Titre, lieu et date de début requis" }, { status: 400 })
    }

    const exhibition = await prisma.exhibition.create({
      data: {
        artistId: artistProfile.id,
        title: title.trim(),
        description: description?.trim() || null,
        location: location.trim(),
        city: city?.trim() || null,
        country: country?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl: imageUrl?.trim() || null,
        link: link?.trim() || null
      }
    })

    return NextResponse.json(exhibition, { status: 201 })
  } catch (error) {
    console.error("Erreur création exposition:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE : Supprimer une exposition
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!artistProfile) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    // Vérifier que l'exposition appartient à l'artiste
    const exhibition = await prisma.exhibition.findFirst({
      where: { id, artistId: artistProfile.id }
    })

    if (!exhibition) {
      return NextResponse.json({ error: "Exposition non trouvée" }, { status: 404 })
    }

    await prisma.exhibition.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression exposition:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
