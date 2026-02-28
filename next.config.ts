import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export as a fully static site — no Vercel Functions, Middleware, or ISR needed.
  // This eliminates Fast Origin Transfer, ISR reads/writes, and image optimization costs entirely.
  output: "export",

  // Required with output: 'export' — next/image optimization is skipped;
  // the logo PNG is served as-is (it's a small static asset, no resize benefit).
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
