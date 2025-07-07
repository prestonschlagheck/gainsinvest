/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 14, no need for experimental flag
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 