/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow server components to import node-only packages
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],

  // Standalone output for better deployment compatibility
  output: 'standalone',
}

export default nextConfig
