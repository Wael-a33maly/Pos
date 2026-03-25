import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // تجاهل أخطاء TypeScript في البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  // تحسين استيراد الحزم الكبيرة
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@tanstack/react-table',
    ],
  },
  
  // تحسين الصور
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Headers للتخزين المؤقت
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=10, stale-while-revalidate=59' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  },
  
  // Turbopack config (فارغ للسماح بالعمل)
  turbopack: {},
};

export default nextConfig;
