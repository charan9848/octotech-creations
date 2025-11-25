/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Development configuration
  allowedDevOrigins: [
    'chrome-extension://*',
    'devtools://*',
    'localhost:*',
    '127.0.0.1:*',
  ],
    // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [
      'res.cloudinary.com',
      'cloudinary.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },  // Redirects for SEO
  async redirects() {
    return [
      // Redirect /home to / for consistency
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Handle rewrites for development tools
  async rewrites() {
    return {
      beforeFiles: [
        // Ensure robots.txt is served correctly
        {
          source: '/robots.txt',
          destination: '/robots.txt',
        },
        // Handle Chrome DevTools requests
        {
          source: '/.well-known/:path*',
          destination: '/api/not-found',
        },
      ],
    };
  },// Experimental features for better performance
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ['framer-motion', '@mui/material', '@mui/icons-material', 'lodash', 'lucide-react', 'react-icons'],
  },
  
  // Transpile packages for better compatibility
  transpilePackages: ['framer-motion'],
};

export default nextConfig;
