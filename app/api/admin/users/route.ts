import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Lister tous les utilisateurs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }
    
    if (role) where.role = role
    if (status) where.status = status
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              orders: true,
              favorites: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Erreur liste utilisateurs:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PUT - Modifier un utilisateur (bloquer, promouvoir, etc.)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }
    
    const { userId, action, newRole } = await req.json()
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId et action requis" },
        { status: 400 }
      )
    }
    
    // Empêcher l'admin de se modifier lui-même
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre compte" },
        { status: 400 }
      )
    }
    
    let updateData: any = {}
    
    switch (action) {
      case "activate":
        updateData.status = "ACTIVE"
        break
      case "suspend":
        updateData.status = "SUSPENDED"
        break
      case "delete":
        updateData.status = "DELETED"
        break
      case "change_role":
        if (!newRole || !["ADMIN", "ARTIST", "BUYER"].includes(newRole)) {
          return NextResponse.json(
            { error: "Rôle invalide" },
            { status: 400 }
          )
        }
        updateData.role = newRole
        break
      default:
        return NextResponse.json(
          { error: "Action invalide" },
          { status: 400 }
        )
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Erreur modification utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
