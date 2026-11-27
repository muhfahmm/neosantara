import type { NextConfig } from "next";

const dialogApiUrl = process.env.DIALOG_API_URL ?? "http://127.0.0.1:8000";
const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) ?? [];

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob: https://flagcdn.com https://lh3.googleusercontent.com https://*.googleusercontent.com;
  connect-src 'self' http://localhost:* https://neosantara.com https://*.neosantara.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.googleapis.com http://127.0.0.1:8000;
  frame-src 'self' https://accounts.google.com https://*.firebaseapp.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  allowedDevOrigins,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  env: {
    NEXT_PUBLIC_TAURI_ANDROID_HMR_PORT: process.env.TAURI_ANDROID_HMR_PORT ?? "",
  },
  images: {
    // Tauri tidak menjalankan Next image optimizer (`/_next/image`).
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, If-None-Match' },
          { key: 'Access-Control-Expose-Headers', value: 'ETag, Retry-After' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
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
