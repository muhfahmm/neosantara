import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
