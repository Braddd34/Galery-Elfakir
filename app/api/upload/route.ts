import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUploadUrl } from "@/lib/s3"
import { uploadLimiter, getClientIP } from "@/lib/rate-limit"

// Taille maximale autorisée : 10 Mo
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo en octets

// Types MIME autorisés
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

// Extensions autorisées
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

// POST: Obtenir une URL signée pour uploader une image
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seuls les artistes et admins peuvent uploader
    if (!session || !["ARTIST", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Rate limiting : max 10 uploads par minute
    const ip = getClientIP(request)
    const { success } = await uploadLimiter.check(`upload-${session.user.id}`, 10)
    if (!success) {
      return NextResponse.json(
        { error: "Trop d'uploads. Veuillez réessayer dans une minute." },
        { status: 429 }
      )
    }

    const { filename, contentType, fileSize } = await request.json()

    // Valider que les champs requis sont présents
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Nom de fichier et type requis" },
        { status: 400 }
      )
    }

    // Vérifier le type MIME
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, GIF." },
        { status: 400 }
      )
    }

    // Vérifier l'extension du fichier (double vérification avec le type MIME)
    const extension = filename.toLowerCase().slice(filename.lastIndexOf("."))
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Extension de fichier non autorisée. Utilisez .jpg, .png, .webp ou .gif." },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier si fournie
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Le fichier est trop volumineux. Taille maximale : ${MAX_FILE_SIZE / (1024 * 1024)} Mo.` },
        { status: 400 }
      )
    }

    // Vérifier la taille du nom de fichier
    if (filename.length > 200) {
      return NextResponse.json(
        { error: "Nom de fichier trop long (max 200 caractères)" },
        { status: 400 }
      )
    }

    // Nettoyer le nom de fichier (supprimer les caractères spéciaux)
    const cleanFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")

    const { signedUrl, publicUrl, key } = await getUploadUrl(cleanFilename, contentType)

    return NextResponse.json({ 
      signedUrl, 
      publicUrl, 
      key,
      maxSize: MAX_FILE_SIZE 
    })
  } catch (error) {
    console.error("Erreur upload:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
