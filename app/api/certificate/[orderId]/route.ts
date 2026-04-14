import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * API pour générer un certificat d'authenticité en HTML imprimable.
 * Le certificat contient les informations de l'œuvre, l'artiste, et un numéro unique.
 * L'utilisateur peut l'imprimer ou le sauvegarder en PDF via le navigateur.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        artwork: {
          include: {
            artist: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        },
        user: { select: { name: true, email: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le propriétaire, l'artiste ou admin
    const isOwner = order.userId === session.user.id
    const isArtist = order.artwork?.artist?.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isArtist && !isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Récupérer les données de l'œuvre (depuis l'artwork actuel ou le snapshot)
    const artworkData = order.artwork || (order.artworkSnapshot as any)
    if (!artworkData) {
      return NextResponse.json({ error: "Données de l'œuvre non disponibles" }, { status: 404 })
    }

    const artistName = order.artwork?.artist?.user?.name || (order.artworkSnapshot as any)?.artistName || "Artiste"
    const buyerName = order.user?.name || "Acheteur"
    const orderDate = new Date(order.paidAt || order.createdAt)
    const certificateNumber = `ELFAKIR-${order.orderNumber}-AUTH`

    // Dimensions
    const width = order.artwork?.width || (order.artworkSnapshot as any)?.width
    const height = order.artwork?.height || (order.artworkSnapshot as any)?.height
    const depth = order.artwork?.depth || (order.artworkSnapshot as any)?.depth

    // Titre et description
    const title = order.artwork?.title || (order.artworkSnapshot as any)?.title || "Œuvre"
    const medium = order.artwork?.medium || (order.artworkSnapshot as any)?.medium || ""
    const year = order.artwork?.year || (order.artworkSnapshot as any)?.year || ""
    const category = order.artwork?.category || (order.artworkSnapshot as any)?.category || ""

    // Image
    let imageUrl = ""
    try {
      const images = order.artwork?.images
      if (images) {
        const parsed = typeof images === "string" ? JSON.parse(images) : images
        if (parsed?.[0]?.url) imageUrl = parsed[0].url
      }
    } catch {}

    // Générer le HTML du certificat
    const html = generateCertificateHTML({
      certificateNumber,
      title,
      artistName,
      buyerName,
      medium,
      year: year?.toString() || "",
      width: width ? Number(width) : 0,
      height: height ? Number(height) : 0,
      depth: depth ? Number(depth) : undefined,
      category,
      orderDate,
      imageUrl,
      orderNumber: order.orderNumber
    })

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      }
    })

  } catch (error) {
    console.error("Erreur génération certificat:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

interface CertificateData {
  certificateNumber: string
  title: string
  artistName: string
  buyerName: string
  medium: string
  year: string
  width: number
  height: number
  depth?: number
  category: string
  orderDate: Date
  imageUrl: string
  orderNumber: string
}

function generateCertificateHTML(data: CertificateData): string {
  const dateFormatted = data.orderDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const categoryLabels: Record<string, string> = {
    PAINTING: "Peinture",
    SCULPTURE: "Sculpture",
    PHOTOGRAPHY: "Photographie",
    DRAWING: "Dessin",
    PRINT: "Estampe",
    DIGITAL: "Art numérique",
    MIXED_MEDIA: "Technique mixte",
    OTHER: "Autre"
  }

  const dimensions = data.depth
    ? `${data.width} × ${data.height} × ${data.depth} cm`
    : `${data.width} × ${data.height} cm`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificat d'authenticité — ${data.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      background: #f5f5f0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 20px;
    }
    
    .certificate {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      padding: 50px 60px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 40px rgba(0,0,0,0.1);
    }
    
    /* Bordure dorée */
    .border-frame {
      position: absolute;
      top: 20px;
      right: 20px;
      bottom: 20px;
      left: 20px;
      border: 1px solid #c9a962;
      pointer-events: none;
    }
    
    .border-frame::before {
      content: '';
      position: absolute;
      top: 5px;
      right: 5px;
      bottom: 5px;
      left: 5px;
      border: 0.5px solid #c9a96240;
    }
    
    /* Coins décoratifs */
    .corner { position: absolute; width: 30px; height: 30px; }
    .corner-tl { top: -1px; left: -1px; border-top: 2px solid #c9a962; border-left: 2px solid #c9a962; }
    .corner-tr { top: -1px; right: -1px; border-top: 2px solid #c9a962; border-right: 2px solid #c9a962; }
    .corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid #c9a962; border-left: 2px solid #c9a962; }
    .corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid #c9a962; border-right: 2px solid #c9a962; }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .logo {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      letter-spacing: 0.5em;
      font-weight: 300;
      color: #1a1a1a;
      margin-bottom: 30px;
    }
    
    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 300;
      color: #c9a962;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 300;
      font-style: italic;
      color: #888;
      letter-spacing: 0.1em;
    }
    
    .artwork-section {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
      align-items: flex-start;
    }
    
    .artwork-image {
      width: 200px;
      height: 250px;
      object-fit: cover;
      border: 1px solid #e5e5e5;
      flex-shrink: 0;
    }
    
    .artwork-details {
      flex: 1;
    }
    
    .artwork-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    
    .artwork-artist {
      font-size: 16px;
      color: #c9a962;
      margin-bottom: 24px;
      font-weight: 400;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .detail-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .detail-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #999;
      margin-bottom: 4px;
    }
    
    .detail-value {
      font-size: 14px;
      color: #333;
    }
    
    .declaration {
      margin: 40px 0;
      padding: 30px;
      background: #fafaf8;
      border-left: 3px solid #c9a962;
    }
    
    .declaration p {
      font-size: 13px;
      line-height: 1.8;
      color: #555;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 40px;
    }
    
    .signature-block {
      text-align: center;
      width: 200px;
    }
    
    .signature-line {
      width: 100%;
      border-bottom: 1px solid #ccc;
      margin-bottom: 8px;
      height: 40px;
    }
    
    .signature-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #999;
    }
    
    .signature-name {
      font-size: 13px;
      color: #333;
      margin-top: 4px;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
    }
    
    .cert-number {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      letter-spacing: 0.2em;
      color: #aaa;
      margin-bottom: 8px;
    }
    
    .footer-date {
      font-size: 12px;
      color: #999;
    }
    
    /* Boutons d'impression (cachés à l'impression) */
    .print-actions {
      text-align: center;
      margin: 20px 0;
    }
    
    .print-btn {
      padding: 12px 30px;
      background: #1a1a1a;
      color: #fff;
      border: none;
      font-size: 14px;
      letter-spacing: 0.1em;
      cursor: pointer;
      margin: 0 8px;
      transition: background 0.2s;
    }
    
    .print-btn:hover {
      background: #c9a962;
    }
    
    @media print {
      body { background: #fff; padding: 0; }
      .certificate { box-shadow: none; }
      .print-actions { display: none !important; }
    }
  </style>
</head>
<body>
  <div>
    <div class="print-actions">
      <button class="print-btn" onclick="window.print()">
        🖨️ Imprimer / Sauvegarder en PDF
      </button>
      <button class="print-btn" onclick="window.close()">
        ← Retour
      </button>
    </div>
    
    <div class="certificate">
      <div class="border-frame">
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
      </div>
      
      <div class="header">
        <div class="logo">ELFAKIR</div>
        <div class="title">Certificat d'authenticité</div>
        <div class="subtitle">Certificate of Authenticity</div>
      </div>
      
      <div class="artwork-section">
        ${data.imageUrl ? `<img src="${escapeHtml(data.imageUrl)}" alt="${escapeHtml(data.title)}" class="artwork-image" />` : ""}
        <div class="artwork-details">
          <div class="artwork-title">${escapeHtml(data.title)}</div>
          <div class="artwork-artist">par ${escapeHtml(data.artistName)}</div>
          
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Catégorie</div>
              <div class="detail-value">${escapeHtml(categoryLabels[data.category] || data.category)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Technique</div>
              <div class="detail-value">${escapeHtml(data.medium)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Dimensions</div>
              <div class="detail-value">${dimensions}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Année de création</div>
              <div class="detail-value">${data.year}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="declaration">
        <p>
          La galerie <strong>ELFAKIR</strong> certifie que l'œuvre ci-dessus décrite est une création 
          originale et authentique de l'artiste <strong>${escapeHtml(data.artistName)}</strong>. Cette œuvre est 
          une pièce unique, non reproduite, et a été acquise en date du <strong>${dateFormatted}</strong> 
          par <strong>${escapeHtml(data.buyerName)}</strong>.
        </p>
        <br>
        <p>
          Ce certificat atteste de l'authenticité de l'œuvre et accompagne celle-ci à titre de garantie. 
          Il est délivré en un seul exemplaire et ne peut être ni copié ni reproduit.
        </p>
      </div>
      
      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">L'artiste</div>
          <div class="signature-name">${escapeHtml(data.artistName)}</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">La galerie</div>
          <div class="signature-name">ELFAKIR Gallery</div>
        </div>
      </div>
      
      <div class="footer">
        <div class="cert-number">N° ${data.certificateNumber}</div>
        <div class="footer-date">Délivré le ${dateFormatted}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}
