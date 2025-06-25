/** @type {import('next').NextConfig} */
const path = require('path');
const { createSecureHeaders } = require('next-secure-headers');

const nextConfig = {
  // Only .ts and .tsx become pages/routes—no .mdx
  pageExtensions: ['ts', 'tsx'],
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cysceyktgavybhaehpxw.supabase.co',
        pathname: '/storage/v1/object/public/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // filesystem caching for faster dev rebuilds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        version: 'v1',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache'),
      };
    }
    return config;
  },

  // secure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;
