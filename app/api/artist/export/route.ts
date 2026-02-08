import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Exporter les données en CSV
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    // Récupérer le profil artiste
    const artist = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!artist) {
      return NextResponse.json(
        { error: "Profil artiste non trouvé" },
        { status: 404 }
      )
    }
    
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "sales" // sales | artworks
    
    if (type === "sales") {
      // Export des ventes
      const orders = await prisma.order.findMany({
        where: {
          artwork: { artistId: artist.id },
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
      
      // En-têtes CSV
      const headers = [
        "Numéro commande",
        "Date",
        "Œuvre",
        "Acheteur",
        "Prix total (€)",
        "Commission (%)",
        "Votre revenu (€)",
        "Statut",
        "Livraison"
      ]
      
      // Lignes CSV
      const rows = orders.map(order => {
        const snapshot = order.artworkSnapshot as any
        return [
          order.orderNumber,
          order.paidAt?.toISOString().split("T")[0] || order.createdAt.toISOString().split("T")[0],
          snapshot?.title || "N/A",
          order.user.name || order.user.email,
          Number(order.total).toFixed(2),
          Number(order.commissionRate).toFixed(0),
          Number(order.artistPayout).toFixed(2),
          order.status,
          order.trackingNumber || "Non expédié"
        ]
      })
      
      // Générer le CSV
      const csv = [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      ].join("\n")
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ventes_${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    } else if (type === "artworks") {
      // Export des œuvres
      const artworks = await prisma.artwork.findMany({
        where: { artistId: artist.id },
        orderBy: { createdAt: "desc" }
      })
      
      // En-têtes CSV
      const headers = [
        "Titre",
        "Catégorie",
        "Année",
        "Dimensions (cm)",
        "Technique",
        "Prix (€)",
        "Statut",
        "Vues",
        "Date création"
      ]
      
      // Lignes CSV
      const rows = artworks.map(artwork => [
        artwork.title,
        artwork.category,
        artwork.year,
        `${artwork.width}x${artwork.height}${artwork.depth ? `x${artwork.depth}` : ""}`,
        artwork.medium,
        Number(artwork.price).toFixed(2),
        artwork.status,
        artwork.views,
        artwork.createdAt.toISOString().split("T")[0]
      ])
      
      // Générer le CSV
      const csv = [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      ].join("\n")
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="oeuvres_${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    }
    
    return NextResponse.json(
      { error: "Type d'export invalide" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Erreur export:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
