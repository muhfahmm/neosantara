import type { NextConfig } from "next";

const dialogApiUrl = process.env.DIALOG_API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: {
    // Tauri tidak menjalankan Next image optimizer (`/_next/image`).
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, If-None-Match' },
          { key: 'Access-Control-Expose-Headers', value: 'ETag' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/api/negotiate-choice', destination: `${dialogApiUrl}/api/negotiate-choice` },
      { source: '/api/confirm-policy', destination: `${dialogApiUrl}/api/confirm-policy` },
    ];
  },
  typescript: {
    tsconfigPath: process.env.NEXT_TSCONFIG_PATH ?? "tsconfig.json",
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    reactDebugChannel: false,
  },
  turbopack: {},
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/game',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
