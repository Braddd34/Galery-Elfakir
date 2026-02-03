import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Galerie ELFAKIR - Art en Ligne",
    template: "%s | Galerie ELFAKIR",
  },
  description: "Découvrez et achetez des œuvres d'art originales d'artistes internationaux. Galerie d'art en ligne avec certificat d'authenticité.",
  keywords: ["art", "galerie", "peinture", "sculpture", "artiste", "œuvre originale", "art contemporain"],
  authors: [{ name: "Galerie ELFAKIR" }],
  creator: "Galerie ELFAKIR",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://galerie-elfakir.vercel.app",
    siteName: "Galerie ELFAKIR",
    title: "Galerie ELFAKIR - Art en Ligne",
    description: "Découvrez et achetez des œuvres d'art originales d'artistes internationaux",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Galerie ELFAKIR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galerie ELFAKIR - Art en Ligne",
    description: "Découvrez et achetez des œuvres d'art originales",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
