import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-232263f4-2459-424c-9d9c-504b39c1ed32.space-z.ai",
    "https://preview-6a21c295-9457-48d2-a4c1-ae40cc358a3a.space-z.ai",
  ],
};

export default nextConfig;
