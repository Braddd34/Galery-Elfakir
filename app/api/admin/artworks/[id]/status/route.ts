import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sendArtworkApprovedEmail } from "@/lib/emails"
import { notifyArtworkApproved, notifyArtworkRejected } from "@/lib/notifications"

// PATCH: Changer le statut d'une œuvre rapidement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { status, comment } = await request.json()

    // Valider le statut
    const validStatuses = ["DRAFT", "PENDING", "AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Mettre à jour le statut (et publier si approuvé)
    const artwork = await prisma.artwork.update({
      where: { id: params.id },
      data: { 
        status,
        ...(status === "AVAILABLE" ? { publishedAt: new Date() } : {})
      },
      include: {
        artist: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    })

    // Envoyer notification + email si l'œuvre est approuvée
    if (status === "AVAILABLE" && artwork.artist?.user) {
      const artistUser = artwork.artist.user

      // Email d'approbation
      sendArtworkApprovedEmail(artistUser.email, {
        title: artwork.title,
        artistName: artistUser.name || "Artiste",
        artistEmail: artistUser.email
      }).catch(err => console.error("Erreur email approbation:", err))

      // Notification in-app
      notifyArtworkApproved(artistUser.id, artwork.title)
        .catch(err => console.error("Erreur notification approbation:", err))
    }

    // Notifier si l'œuvre est archivée/refusée, avec le commentaire de l'admin
    if ((status === "ARCHIVED" || status === "DRAFT") && artwork.artist?.user) {
      notifyArtworkRejected(artwork.artist.user.id, artwork.title, comment || undefined)
        .catch(err => console.error("Erreur notification rejet:", err))
    }

    return NextResponse.json({ 
      success: true, 
      artwork: { id: artwork.id, status: artwork.status },
      message: `Statut mis à jour: ${status}`
    })

  } catch (error) {
    console.error("Erreur changement statut:", error)
    return NextResponse.json({ error: "Erreur lors du changement de statut" }, { status: 500 })
  }
}
