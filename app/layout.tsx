import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"
import { CompareProvider } from "@/components/artwork/CompareDrawer"
import ThemeProvider from "@/components/providers/ThemeProvider"
import LanguageProvider from "@/components/providers/LanguageProvider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import SkipLink from "@/components/ui/SkipLink"
import NetworkStatus from "@/components/ui/NetworkStatus"
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister"

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
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        {/* Script inline pour éviter le flash de thème au chargement */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="theme-bg theme-text min-h-screen transition-colors duration-300">
        <SkipLink />
        <NetworkStatus />
        <SessionProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CompareProvider>
                {children}
              </CompareProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
        <ServiceWorkerRegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
