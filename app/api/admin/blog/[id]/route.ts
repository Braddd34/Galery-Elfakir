import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * PUT /api/admin/blog/[id] — Modifier un article (admin uniquement).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, excerpt, coverImage, published } = body

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (content !== undefined) data.content = content
    if (excerpt !== undefined) data.excerpt = excerpt || null
    if (coverImage !== undefined) data.coverImage = coverImage || null
    if (published !== undefined) {
      data.published = published
      if (published && !existing.publishedAt) {
        data.publishedAt = new Date()
      }
      if (!published) {
        data.publishedAt = null
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Erreur PUT /api/admin/blog/[id]:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/blog/[id] — Supprimer un article (admin uniquement).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    await prisma.blogPost.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur DELETE /api/admin/blog/[id]:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
