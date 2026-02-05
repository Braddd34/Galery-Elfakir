import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://galeryelfakir.vercel.app'

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogue`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artistes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Pages des œuvres (dynamiques)
  let artworkPages: MetadataRoute.Sitemap = []
  try {
    const artworks = await prisma.artwork.findMany({
      where: { status: 'AVAILABLE' },
      select: { slug: true, updatedAt: true },
    })

    artworkPages = artworks.map((artwork) => ({
      url: `${baseUrl}/oeuvre/${artwork.slug}`,
      lastModified: artwork.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Erreur génération sitemap œuvres:', error)
  }

  // Pages des artistes (dynamiques)
  let artistPages: MetadataRoute.Sitemap = []
  try {
    const artists = await prisma.artistProfile.findMany({
      where: {
        user: { status: 'ACTIVE' },
        artworks: { some: { status: 'AVAILABLE' } }
      },
      select: { id: true, updatedAt: true },
    })

    artistPages = artists.map((artist) => ({
      url: `${baseUrl}/artiste/${artist.id}`,
      lastModified: artist.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Erreur génération sitemap artistes:', error)
  }

  return [...staticPages, ...artworkPages, ...artistPages]
}
