import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import CertificateClient from "./CertificateClient"

// Récupérer l'œuvre par ID
async function getArtwork(id: string) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })
    return artwork
  } catch {
    return null
  }
}

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const artwork = await getArtwork(params.id)

  if (!artwork) {
    notFound()
  }

  const artistName = artwork.artist.user.name || "Artiste"
  const certNumber = `ELFAKIR-${artwork.id.slice(-8).toUpperCase()}`

  // Obtenir l'URL de l'image
  let imageUrl = ""
  try {
    const images = typeof artwork.images === "string" ? JSON.parse(artwork.images) : artwork.images
    imageUrl = images?.[0]?.url || ""
  } catch {}

  return (
    <CertificateClient
      artwork={{
        title: artwork.title,
        year: artwork.year,
        medium: artwork.medium,
        width: Number(artwork.width),
        height: Number(artwork.height),
        depth: artwork.depth ? Number(artwork.depth) : null,
        slug: artwork.slug,
        description: artwork.description
      }}
      artistName={artistName}
      certNumber={certNumber}
      imageUrl={imageUrl}
    />
  )
}
