/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Formats modernes pour réduire la taille des images (avif = ~30% plus petit que webp)
    formats: ["image/avif", "image/webp"],
    // Tailles responsives pour les différents écrans
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 's3.eu-west-3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'elfakir-gallery.s3.eu-west-3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing
      },
      {
        protocol: 'https',
        hostname: '*.utfs.io', // UploadThing CDN
      },
    ],
  },
  // Optimizations
  reactStrictMode: true,
  swcMinify: true,
  // Masquer le header X-Powered-By pour la sécurité
  poweredByHeader: false,
  // Supprimer les console.log en production (garde console.error et console.warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  
  // Cache headers + sécurité
  async headers() {
    return [
      {
        // Headers de sécurité pour toutes les pages
        source: "/(.*)",
        headers: [
          {
            // Empêche le navigateur de deviner le type MIME (protection XSS)
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Empêche l'inclusion en iframe par d'autres sites (protection clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Active la protection XSS du navigateur
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            // Contrôle les informations envoyées dans le header Referer
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Empêche certains types d'attaques via les permissions du navigateur
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // HSTS — force les navigateurs à utiliser HTTPS pendant 1 an
            // includeSubDomains protège les sous-domaines aussi
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            // CSP — Content-Security-Policy
            // Politique qui contrôle d'où le navigateur peut charger des ressources.
            // - default-src 'self' : par défaut, seulement notre domaine
            // - script-src 'self' 'unsafe-inline' 'unsafe-eval' : scripts locaux + inline (requis par Next.js)
            // - style-src 'self' 'unsafe-inline' : styles locaux + inline (requis par Tailwind)
            // - img-src : nos domaines d'images autorisés + data: pour les placeholders
            // - font-src 'self' : fonts locales
            // - connect-src 'self' : requêtes API vers notre domaine
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://s3.eu-west-3.amazonaws.com https://elfakir-gallery.s3.eu-west-3.amazonaws.com https://utfs.io https://*.utfs.io; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      {
        // Cache immutable pour les assets statiques (images, fonts, JS/CSS)
        source: "/:path*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache court pour le manifest PWA
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        // Cache court pour le service worker (doit être revalidé souvent)
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ]
  },
}

export default nextConfig
