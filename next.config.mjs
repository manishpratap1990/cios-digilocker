/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],
  output: 'standalone',
}

export default nextConfig
