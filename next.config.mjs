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
  
  // Cache headers pour la performance
  async headers() {
    return [
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
        // Cache court pour le service worker
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
