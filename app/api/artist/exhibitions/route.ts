import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - Récupérer les expositions d'un artiste
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const artistId = searchParams.get("artistId")
    
    if (!artistId) {
      return NextResponse.json(
        { error: "artistId requis" },
        { status: 400 }
      )
    }
    
    const exhibitions = await prisma.exhibition.findMany({
      where: { artistId },
      orderBy: { startDate: "desc" }
    })
    
    return NextResponse.json(exhibitions)
  } catch (error) {
    console.error("Erreur récupération expositions:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Créer une exposition (artiste uniquement)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const artist = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!artist) {
      return NextResponse.json(
        { error: "Profil artiste non trouvé" },
        { status: 404 }
      )
    }
    
    const { title, description, location, city, country, startDate, endDate, imageUrl, link } = await req.json()
    
    if (!title || !location || !startDate) {
      return NextResponse.json(
        { error: "Titre, lieu et date de début requis" },
        { status: 400 }
      )
    }
    
    const exhibition = await prisma.exhibition.create({
      data: {
        artistId: artist.id,
        title,
        description: description || null,
        location,
        city: city || null,
        country: country || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl: imageUrl || null,
        link: link || null
      }
    })
    
    return NextResponse.json(exhibition, { status: 201 })
  } catch (error) {
    console.error("Erreur création exposition:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une exposition
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "id requis" },
        { status: 400 }
      )
    }
    
    const artist = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!artist) {
      return NextResponse.json(
        { error: "Profil artiste non trouvé" },
        { status: 404 }
      )
    }
    
    const exhibition = await prisma.exhibition.findUnique({
      where: { id }
    })
    
    if (!exhibition || exhibition.artistId !== artist.id) {
      return NextResponse.json(
        { error: "Exposition non trouvée ou non autorisée" },
        { status: 404 }
      )
    }
    
    await prisma.exhibition.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression exposition:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
