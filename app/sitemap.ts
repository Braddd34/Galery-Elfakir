import { MetadataRoute } from "next"
import prisma from "@/lib/prisma"
import { SITE_URL } from "@/lib/constants"

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
  const baseUrl = SITE_URL

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/catalogue`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/artistes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cgv`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
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

  // Pages blog dynamiques
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true }
    })
    blogPages = [
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
      ...posts.map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6
      }))
    ]
  } catch (error) {
    console.error("Erreur sitemap blog:", error)
  }

  // Pages expositions virtuelles dynamiques
  let exhibitionPages: MetadataRoute.Sitemap = []
  try {
    const exhibitions = await prisma.virtualExhibition.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true }
    })
    exhibitionPages = [
      { url: `${baseUrl}/expositions-virtuelles`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
      ...exhibitions.map((e) => ({
        url: `${baseUrl}/expositions-virtuelles/${e.slug}`,
        lastModified: e.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6
      }))
    ]
  } catch (error) {
    console.error("Erreur sitemap expositions:", error)
  }

  return [...staticPages, ...artworkPages, ...artistPages, ...blogPages, ...exhibitionPages]
}
