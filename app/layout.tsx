import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"

export const metadata: Metadata = {
  title: {
    default: "ELFAKIR — Galerie d'Art Contemporain",
    template: "%s — ELFAKIR",
  },
  description: "Galerie d'art contemporain en ligne. Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
  keywords: ["galerie d'art", "art contemporain", "œuvres originales", "artistes", "peinture", "sculpture", "acheter art", "collection art"],
  authors: [{ name: "ELFAKIR" }],
  creator: "ELFAKIR Gallery",
  publisher: "ELFAKIR",
  metadataBase: new URL("https://galeryelfakir.vercel.app"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ELFAKIR",
    title: "ELFAKIR — Galerie d'Art Contemporain",
    description: "Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ELFAKIR — Galerie d'Art Contemporain",
    description: "Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="bg-black">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
