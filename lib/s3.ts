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

// Récupérer un objet S3 en stream (pour proxy d’images)
export async function getObjectStream(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  return s3Client.send(command)
}
