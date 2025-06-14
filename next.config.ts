
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Allow eval and inline scripts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles and Google Fonts CSS
      "img-src 'self' data: https://placehold.co", // Allow self, data URIs, and placehold.co images
      "font-src 'self' https://fonts.gstatic.com", // Allow self and Google Fonts
      "connect-src 'self' https://fonts.googleapis.com", // Allow connections to self and Google Fonts API
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
