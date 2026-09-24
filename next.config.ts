import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.mp3': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
