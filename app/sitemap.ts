import { MetadataRoute } from "next"
import prisma from "@/lib/prisma"

/**
 * Génère automatiquement le sitemap.xml du site.
 * Next.js transforme ce fichier en XML valide accessible à /sitemap.xml.
 * 
 * Inclut :
 * - Les pages statiques (accueil, catalogue, à propos, FAQ, contact)
 * - Toutes les œuvres disponibles (dynamique depuis la DB)
 * - Tous les artistes actifs (dynamique depuis la DB)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://galeryelfakir.vercel.app"

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/catalogue`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/artistes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  // Pages d'œuvres dynamiques
  let artworkPages: MetadataRoute.Sitemap = []
  try {
    const artworks = await prisma.artwork.findMany({
      where: { status: "AVAILABLE" },
      select: { slug: true, updatedAt: true }
    })
    artworkPages = artworks.map((a) => ({
      url: `${baseUrl}/oeuvre/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  } catch (error) {
    console.error("Erreur sitemap œuvres:", error)
  }

  // Pages artistes dynamiques
  let artistPages: MetadataRoute.Sitemap = []
  try {
    const artists = await prisma.artistProfile.findMany({
      select: { id: true, updatedAt: true }
    })
    artistPages = artists.map((a) => ({
      url: `${baseUrl}/artiste/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  } catch (error) {
    console.error("Erreur sitemap artistes:", error)
  }

  return [...staticPages, ...artworkPages, ...artistPages]
}
