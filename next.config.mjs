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
}

export default nextConfig
