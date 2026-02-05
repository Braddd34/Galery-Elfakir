import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://galeryelfakir.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',        // Pages admin
          '/dashboard/',    // Pages dashboard utilisateur
          '/api/',          // Routes API
          '/login',         // Page de connexion
          '/register',      // Page d'inscription
          '/checkout/',     // Pages de paiement
          '/certificat/',   // Certificats (privés)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
