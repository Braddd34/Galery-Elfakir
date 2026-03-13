import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * GET /api/admin/blog — Liste tous les articles (admin uniquement, brouillons inclus).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Erreur GET /api/admin/blog:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/blog — Créer un article (admin uniquement).
 * Le slug est auto-généré à partir du titre.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, excerpt, coverImage, published } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis" },
        { status: 400 }
      )
    }

    let slug = generateSlug(title)

    // S'assurer que le slug est unique en ajoutant un suffixe si nécessaire
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: "create_blog_post",
      target: post.id,
      details: { title: post.title, published }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Erreur POST /api/admin/blog:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
