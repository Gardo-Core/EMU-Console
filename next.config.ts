import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Ottimizzazione per l'output WebAssembly per prevenire loop in fase di build
    config.output.webassemblyModuleFilename = isServer 
      ? '../static/wasm/[modulehash].wasm' 
      : 'static/wasm/[modulehash].wasm';

    return config;
  },
  // Acknowledge custom webpack config to silence Turbopack error in Next.js 16+
  turbopack: {},
};

export default nextConfig;
