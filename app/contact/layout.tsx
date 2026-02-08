import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez la galerie ELFAKIR pour toute question sur nos œuvres, artistes ou commandes. Notre équipe vous répond sous 24-48h.",
  keywords: ["contact galerie", "question art", "acheter œuvre", "ELFAKIR contact"],
  openGraph: {
    title: "Contactez-nous — ELFAKIR Gallery",
    description: "Contactez la galerie ELFAKIR pour toute question sur nos œuvres, artistes ou commandes.",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contactez-nous — ELFAKIR Gallery",
    description: "Contactez la galerie ELFAKIR pour toute question sur nos œuvres, artistes ou commandes.",
    images: ["/og-image.jpg"],
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
