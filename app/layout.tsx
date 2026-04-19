import type { Metadata } from "next"
import { headers } from "next/headers"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"
import { CompareProvider } from "@/components/artwork/CompareDrawer"
import { FavoritesProvider } from "@/lib/favorites-context"
import ThemeProvider from "@/components/providers/ThemeProvider"
import LanguageProvider from "@/components/providers/LanguageProvider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import SkipLink from "@/components/ui/SkipLink"
import NetworkStatus from "@/components/ui/NetworkStatus"
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister"
import CookieConsent from "@/components/ui/CookieConsent"
import { SITE_URL } from "@/lib/constants"

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
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ELFAKIR",
    title: "ELFAKIR — Galerie d'Art Contemporain",
    description: "Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ELFAKIR — Galerie d'Art Contemporain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELFAKIR — Galerie d'Art Contemporain",
    description: "Découvrez une collection exclusive d'œuvres originales d'artistes internationaux.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
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

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light'}}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = headers().get("x-nonce") ?? undefined

  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/icon" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="theme-bg theme-text min-h-screen transition-colors duration-300">
        <SkipLink />
        <NetworkStatus />
        <SessionProvider>
          <ThemeProvider>
            <LanguageProvider>
              <FavoritesProvider>
                <CompareProvider>
                  {children}
                </CompareProvider>
              </FavoritesProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
        <CookieConsent />
        <ServiceWorkerRegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
