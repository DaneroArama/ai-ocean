import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    rules: {
      '*.mp3': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
