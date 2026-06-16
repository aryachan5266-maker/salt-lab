import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  /* config options here */
  allowedDevOrigins: [
    '*.dev.coze.site',
    'localhost',
    'localhost:5176',
    '127.0.0.1',
    '127.0.0.1:5176',
    '192.168.10.183',
    '192.168.10.183:5176',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
