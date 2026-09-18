import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Type errors now FAIL the build (typescript.ignoreBuildErrors removed).
  // Keep `npx tsc --noEmit` in your loop; build re-runs the same checks.
  reactStrictMode: false,
  // There is another (older, Tailwind v3) project scaffold one level up at
  // ..\ that also has a package-lock.json. Without pinning the root, Next
  // infers ..\ as the workspace root and resolves "tailwindcss" (and other
  // deps) from ITS node_modules — which breaks the v4 @import "tailwindcss".
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: [
    "https://preview-chat-232263f4-2459-424c-9d9c-504b39c1ed32.space-z.ai",
    "https://preview-6a21c295-9457-48d2-a4c1-ae40cc358a3a.space-z.ai",
  ],
};

export default nextConfig;
