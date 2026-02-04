import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUploadUrl } from "@/lib/s3"

// POST: Obtenir une URL signée pour uploader une image
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seuls les artistes et admins peuvent uploader
    if (!session || !["ARTIST", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { filename, contentType } = await request.json()

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF." },
        { status: 400 }
      )
    }

    // Vérifier la taille du nom de fichier
    if (filename.length > 200) {
      return NextResponse.json(
        { error: "Nom de fichier trop long" },
        { status: 400 }
      )
    }

    const { signedUrl, publicUrl, key } = await getUploadUrl(filename, contentType)

    return NextResponse.json({ signedUrl, publicUrl, key })
  } catch (error) {
    console.error("Erreur upload:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
