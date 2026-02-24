import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
  const random = Math.random().toString(36).slice(-4)
  return `${base}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)))
    const skip = (page - 1) * limit
    const admin = searchParams.get("admin") === "true"
    const statusFilter = searchParams.get("status")

    const session = await getServerSession(authOptions)
    const isAdmin = admin && session?.user?.role === "ADMIN"

    const whereClause: { status?: string } = {}
    if (!isAdmin) {
      whereClause.status = "PUBLISHED"
    } else if (statusFilter && ["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED"].includes(statusFilter)) {
      whereClause.status = statusFilter
    }

    const [exhibitions, total] = await Promise.all([
      prisma.virtualExhibition.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { artworks: true } },
          createdBy: {
            select: { name: true, image: true },
          },
        },
      }),
      prisma.virtualExhibition.count({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      exhibitions,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error("Erreur GET /api/virtual-exhibitions:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const role = session.user.role as string
    if (role !== "ADMIN" && role !== "MANAGER" && role !== "ARTIST") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, theme, coverImage, startDate, endDate, roomConfig, status: bodyStatus } = body

    if (!title || !description || !theme) {
      return NextResponse.json(
        { error: "Le titre, la description et le thème sont requis" },
        { status: 400 }
      )
    }

    let status = role === "ARTIST" ? "PENDING" : "DRAFT"
    if (role === "ADMIN" && bodyStatus && ["DRAFT", "PENDING", "PUBLISHED"].includes(bodyStatus)) {
      status = bodyStatus
    }
    let slug = generateSlug(title)
    const existing = await prisma.virtualExhibition.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const exhibition = await prisma.virtualExhibition.create({
      data: {
        title,
        description: description || null,
        theme: theme || "white",
        coverImage: coverImage || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        roomConfig: roomConfig || null,
        slug,
        status,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(exhibition, { status: 201 })
  } catch (error) {
    console.error("Erreur POST /api/virtual-exhibitions:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
