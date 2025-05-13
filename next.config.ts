
import type {NextConfig} from 'next';

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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Content Security Policy (CSP) -  Start with a basic one and adjust as needed
          // This is a very restrictive example, you'll likely need to expand it based on your app's resources
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://picsum.photos data:; font-src 'self'; connect-src 'self';",
          // },
        ],
      },
      {
        // Specifically for the service worker to ensure it's served with the correct MIME type
        // and to prevent it from being cached by browsers in a way that makes updates difficult.
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
           {
            key: 'Service-Worker-Allowed',
            value: '/',
          }
        ],
      },
       {
        // For the manifest file
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate', // Or a longer max-age if it doesn't change often
          },
        ],
      }
    ];
  },
};

export default nextConfig;
