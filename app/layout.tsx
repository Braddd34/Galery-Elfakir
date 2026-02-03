import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"

export const metadata: Metadata = {
  title: {
    default: "ELFAKIR — Galerie d'Art Contemporain",
    template: "%s — ELFAKIR",
  },
  description: "Galerie d'art contemporain en ligne. Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
  keywords: ["galerie d'art", "art contemporain", "œuvres originales", "artistes", "peinture", "sculpture"],
  authors: [{ name: "ELFAKIR" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ELFAKIR",
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
