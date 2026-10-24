import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/negotiate-choice', destination: 'http://127.0.0.1:8000/api/negotiate-choice' }];
  },
  transpilePackages: ['../map-engine-rs/ts'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
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
