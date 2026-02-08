import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - Vérifier si l'utilisateur suit un artiste
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false })
    }
    
    const { searchParams } = new URL(req.url)
    const artistId = searchParams.get("artistId")
    
    if (!artistId) {
      return NextResponse.json(
        { error: "artistId requis" },
        { status: 400 }
      )
    }
    
    const follow = await prisma.follow.findUnique({
      where: {
        userId_artistId: {
          userId: session.user.id,
          artistId
        }
      }
    })
    
    // Compter le nombre de followers
    const followersCount = await prisma.follow.count({
      where: { artistId }
    })
    
    return NextResponse.json({
      isFollowing: !!follow,
      followersCount
    })
  } catch (error) {
    console.error("Erreur vérification follow:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Suivre/Ne plus suivre un artiste
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const { artistId } = await req.json()
    
    if (!artistId) {
      return NextResponse.json(
        { error: "artistId requis" },
        { status: 400 }
      )
    }
    
    // Vérifier que l'artiste existe
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId }
    })
    
    if (!artist) {
      return NextResponse.json(
        { error: "Artiste introuvable" },
        { status: 404 }
      )
    }
    
    // Vérifier si on suit déjà
    const existingFollow = await prisma.follow.findUnique({
      where: {
        userId_artistId: {
          userId: session.user.id,
          artistId
        }
      }
    })
    
    if (existingFollow) {
      // Ne plus suivre
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      })
      
      const followersCount = await prisma.follow.count({
        where: { artistId }
      })
      
      return NextResponse.json({
        isFollowing: false,
        followersCount,
        message: "Vous ne suivez plus cet artiste"
      })
    } else {
      // Suivre
      await prisma.follow.create({
        data: {
          userId: session.user.id,
          artistId
        }
      })
      
      const followersCount = await prisma.follow.count({
        where: { artistId }
      })
      
      return NextResponse.json({
        isFollowing: true,
        followersCount,
        message: "Vous suivez maintenant cet artiste"
      })
    }
  } catch (error) {
    console.error("Erreur follow:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
