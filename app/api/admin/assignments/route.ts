import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

// GET - Lister toutes les assignations gestionnaire ↔ artiste
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const [assignments, allManagers, allArtists] = await Promise.all([
      prisma.artistAssignment.findMany({
        include: {
          manager: {
            select: { id: true, name: true, email: true }
          },
          artist: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
              _count: { select: { artworks: true } }
            }
          }
        },
        orderBy: { assignedAt: "desc" }
      }),
      prisma.user.findMany({
        where: { role: "MANAGER" },
        select: { id: true, name: true, email: true }
      }),
      prisma.artistProfile.findMany({
        select: {
          id: true,
          user: { select: { name: true, email: true } },
          _count: { select: { artworks: true } }
        }
      })
    ])

    // Regrouper les artistes par manager
    const managersMap = new Map<string, {
      id: string
      name: string | null
      email: string
      artists: { id: string; name: string | null; email: string; artworkCount: number }[]
    }>()

    for (const a of assignments) {
      if (!managersMap.has(a.managerId)) {
        managersMap.set(a.managerId, {
          id: a.manager.id,
          name: a.manager.name,
          email: a.manager.email,
          artists: []
        })
      }
      managersMap.get(a.managerId)!.artists.push({
        id: a.artist.id,
        name: a.artist.user.name,
        email: a.artist.user.email,
        artworkCount: a.artist._count.artworks
      })
    }

    // Artistes assignés (récupérer tous les artistId des assignations)
    const assignedArtistIds = new Set(assignments.map(a => a.artistId))

    const unassignedArtists = allArtists
      .filter(ap => !assignedArtistIds.has(ap.id))
      .map(ap => ({
        id: ap.id,
        name: ap.user.name,
        email: ap.user.email,
        artworkCount: ap._count.artworks
      }))

    return NextResponse.json({
      managers: Array.from(managersMap.values()),
      unassignedArtists,
      allManagers
    })
  } catch (error) {
    console.error("Erreur liste assignations:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Assigner un artiste à un gestionnaire
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const { managerId, artistId } = await req.json()

    if (!managerId || !artistId) {
      return NextResponse.json(
        { error: "managerId et artistId requis" },
        { status: 400 }
      )
    }

    // Vérifier que le manager a bien le rôle MANAGER
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true, role: true, name: true }
    })

    if (!manager || manager.role !== "MANAGER") {
      return NextResponse.json(
        { error: "L'utilisateur spécifié n'est pas un gestionnaire" },
        { status: 400 }
      )
    }

    // Vérifier que l'artistId correspond à un ArtistProfile existant
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
      select: { id: true, user: { select: { name: true } } }
    })

    if (!artist) {
      return NextResponse.json(
        { error: "Profil artiste introuvable" },
        { status: 404 }
      )
    }

    // Créer l'assignation (la contrainte @@unique empêche les doublons)
    const assignment = await prisma.artistAssignment.create({
      data: { managerId, artistId }
    })

    await logAudit({
      userId: session.user.id,
      action: "assign_artist",
      target: `manager:${managerId}`,
      details: {
        managerId,
        managerName: manager.name,
        artistId,
        artistName: artist.user.name
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Cet artiste est déjà assigné à ce gestionnaire" },
        { status: 409 }
      )
    }
    console.error("Erreur assignation artiste:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE - Retirer une assignation
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const { managerId, artistId } = await req.json()

    if (!managerId || !artistId) {
      return NextResponse.json(
        { error: "managerId et artistId requis" },
        { status: 400 }
      )
    }

    // Supprimer l'assignation via la contrainte unique composée
    await prisma.artistAssignment.delete({
      where: {
        managerId_artistId: { managerId, artistId }
      }
    })

    await logAudit({
      userId: session.user.id,
      action: "unassign_artist",
      target: `manager:${managerId}`,
      details: { managerId, artistId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Assignation introuvable" },
        { status: 404 }
      )
    }
    console.error("Erreur suppression assignation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
