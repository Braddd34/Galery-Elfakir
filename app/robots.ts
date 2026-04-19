import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/constants"

/**
 * Génère le fichier robots.txt pour les moteurs de recherche.
 * Indique quelles pages indexer et lesquelles ignorer.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
