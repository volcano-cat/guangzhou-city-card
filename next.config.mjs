/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@heroicons/react"],
  },
  serverComponentsExternalPackages: ["ali-oss"],
  outputFileTracingExcludes: {
    "**/*.md": true,
    "**/*.txt": true,
    "**/*.json": true,
    "**/node_modules/.cache/**": true,
    "**/node_modules/prisma/libquery_engine-*": true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    config.externals = [
      ...config.externals,
      {
        'ali-oss': 'ali-oss',
      },
    ]

    return config
  },
}

export default nextConfig
