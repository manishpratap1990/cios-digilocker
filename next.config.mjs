/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
