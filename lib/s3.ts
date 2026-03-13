import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const bucketName = process.env.AWS_BUCKET_NAME!

/** Préfixes de clés S3 autorisés pour la lecture (proxy d'images). Évite le path traversal. */
const ALLOWED_KEY_PREFIXES = ["artworks/", "profile/"]

/**
 * Valide et normalise une clé S3 pour éviter le path traversal.
 * Retourne la clé normalisée si elle est autorisée, sinon null.
 */
export function validateS3Key(key: string): string | null {
  if (!key || typeof key !== "string") return null
  // Interdire les séquences path traversal
  if (key.includes("..")) return null
  // Longueur raisonnable
  if (key.length > 500) return null
  // Pas de slash initial (pathname peut en avoir un enlevé par getKeyFromUrl)
  const trimmed = key.replace(/^\/+/, "")
  if (!trimmed) return null
  // La clé doit commencer par un préfixe autorisé
  const allowed = ALLOWED_KEY_PREFIXES.some((p) => trimmed === p || trimmed.startsWith(p + "/") || trimmed.startsWith(p))
  if (!allowed) return null
  return trimmed
}

// Générer une URL signée pour l'upload (le client upload directement vers S3)
export async function getUploadUrl(filename: string, contentType: string) {
  const key = `artworks/${Date.now()}-${filename}`
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  
  // URL publique de l'image une fois uploadée
  const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  return { signedUrl, publicUrl, key }
}

// Supprimer une image
export async function deleteImage(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  await s3Client.send(command)
}

// Extraire la clé depuis l'URL publique
export function getKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // L'URL est de la forme: https://bucket.s3.region.amazonaws.com/key
    return urlObj.pathname.slice(1) // Enlève le premier /
  } catch {
    return null
  }
}

// Vérifier si une URL pointe vers notre bucket S3
export function isOurS3Url(url: string): boolean {
  if (!url || !url.startsWith("http")) return false
  try {
    const u = new URL(url)
    const bucket = process.env.AWS_BUCKET_NAME
    const region = process.env.AWS_REGION
    return !!bucket && !!region && u.hostname === `${bucket}.s3.${region}.amazonaws.com`
  } catch {
    return false
  }
}

/**
 * Supprime les images S3 d'une oeuvre depuis le champ JSON images.
 * Ignore les erreurs pour ne pas bloquer l'operation principale.
 */
export async function cleanupArtworkImages(images: unknown) {
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images
    if (!Array.isArray(parsed)) return

    await Promise.allSettled(
      parsed.map(async (img: { url?: string; key?: string }) => {
        const key = img.key || getKeyFromUrl(img.url || "")
        if (key) await deleteImage(key)
      })
    )
  } catch {
    // ne pas bloquer l'operation principale
  }
}

/**
 * Supprime une photo de profil S3 depuis son URL.
 */
export async function cleanupProfilePhoto(imageUrl: string | null | undefined) {
  if (!imageUrl || !isOurS3Url(imageUrl)) return
  try {
    const key = getKeyFromUrl(imageUrl)
    if (key) await deleteImage(key)
  } catch {
    // ne pas bloquer l'operation principale
  }
}

// Récupérer un objet S3 en stream (pour proxy d'images)
export async function getObjectStream(key: string) {
  const safeKey = validateS3Key(key)
  if (!safeKey) {
    throw new Error("Clé S3 invalide ou non autorisée")
  }
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: safeKey,
  })
  return s3Client.send(command)
}
