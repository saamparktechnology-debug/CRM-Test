import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
  },
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/list',
    '@fullcalendar/interaction',
    '@fullcalendar/react'
  ],
  async rewrites() {
    const targetUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api/v1'
    const backendOrigin = targetUrl.replace(/\/api(\/v1)?\/?$/, '')
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${targetUrl}/:path*`,
      },
      // Clean direct invoice routes
      {
        source: '/invoice',
        destination: '/sales/invoices',
      },
      {
        source: '/invoices',
        destination: '/sales/invoices',
      },
      {
        source: '/feature/invoice',
        destination: '/sales/invoices',
      },
      {
        source: '/feature/invoices',
        destination: '/sales/invoices',
      },
      // Hierarchical Company + Branch scoped routing -> App Router (routes)
      {
        source: '/:company/:branch/feature/:path*',
        destination: '/:path*',
      },
      // Company scoped routing -> App Router (routes)
      {
        source: '/:company/feature/:path*',
        destination: '/:path*',
      },
      // Standard /feature/* routing -> App Router (routes)
      {
        source: '/feature/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
