import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/certificate": ["./public/fonts/NotoSans*.ttf"],
    "/api/certificate-demo": ["./public/fonts/NotoSans*.ttf"],
  },
  turbopack: {
    rules: {
      "*.mp3": {
        type: "asset",
      },
    },
  },
};

export default nextConfig;
