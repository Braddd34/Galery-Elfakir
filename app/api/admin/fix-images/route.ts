import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { copyObject, deleteImage, getKeyFromUrl, sanitizeS3Key } from "@/lib/s3"

// eslint-disable-next-line no-control-regex
const NON_ASCII = /[^\x00-\x7F]/

function urlHasSpecialChars(url: string): boolean {
  return NON_ASCII.test(decodeURIComponent(url))
}

// POST: Trouve et corrige les images S3 dont le nom contient des caractères spéciaux
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const artworks = await prisma.artwork.findMany({
      select: { id: true, images: true },
    })

    const fixes: { artworkId: string; oldUrl: string; newUrl: string }[] = []
    const errors: { artworkId: string; error: string }[] = []

    for (const artwork of artworks) {
      let images: { url: string }[]
      try {
        images = typeof artwork.images === "string"
          ? JSON.parse(artwork.images)
          : (artwork.images as { url: string }[]) || []
      } catch {
        continue
      }

      if (!Array.isArray(images)) continue

      let changed = false
      const newImages = await Promise.all(
        images.map(async (img) => {
          if (!img.url || !urlHasSpecialChars(img.url)) return img

          const oldKey = getKeyFromUrl(img.url)
          if (!oldKey) return img

          const newKey = sanitizeS3Key(oldKey)
          if (newKey === oldKey) return img

          try {
            await copyObject(oldKey, newKey)
            await deleteImage(oldKey)

            const newUrl = img.url.replace(
              encodeURI(oldKey),
              newKey
            ).replace(oldKey, newKey)

            fixes.push({ artworkId: artwork.id, oldUrl: img.url, newUrl })
            changed = true
            return { ...img, url: newUrl }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            errors.push({ artworkId: artwork.id, error: message })
            return img
          }
        })
      )

      if (changed) {
        await prisma.artwork.update({
          where: { id: artwork.id },
          data: { images: JSON.stringify(newImages) },
        })
      }
    }

    return NextResponse.json({
      message: `${fixes.length} image(s) corrigée(s)`,
      fixes,
      errors,
    })
  } catch (error) {
    console.error("Erreur fix-images:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
