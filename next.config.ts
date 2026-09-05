import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow server components to import node-only packages
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],

  // Suppress Turbopack warning (webpack config not used with Turbopack)
  turbopack: {},
}

export default nextConfig
