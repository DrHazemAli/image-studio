import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.1',
  },
};

export default nextConfig;
