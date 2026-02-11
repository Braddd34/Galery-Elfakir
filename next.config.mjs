/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
