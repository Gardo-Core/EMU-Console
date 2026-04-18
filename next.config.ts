import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  // Acknowledge custom webpack config to silence Turbopack error in Next.js 16+
  turbopack: {},
};

export default nextConfig;
