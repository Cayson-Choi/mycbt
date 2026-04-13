import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'image.engineerlab.co.kr',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['katex'],
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default nextConfig;
