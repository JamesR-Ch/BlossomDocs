import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // Export as a fully static site — no Vercel Functions, Middleware, or ISR needed.
  // This eliminates Fast Origin Transfer, ISR reads/writes, and image optimization costs entirely.
  output: "export",

  // Required with output: 'export' — next/image optimization is skipped;
  // the logo PNG is served as-is (it's a small static asset, no resize benefit).
  images: {
    unoptimized: true,
  },

  // Silence the "webpack config present but no turbopack config" warning in dev.
  // next-pwa injects a webpack plugin, but it is disabled in development entirely
  // (disable: NODE_ENV === 'development'), so Turbopack can run without conflict.
  // Production builds use --webpack explicitly to let Workbox do its job.
  turbopack: {},
};

export default withPWA({
  dest: "public",

  // Cache pages navigated client-side so all 3 routes work fully offline.
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,

  // Reload from network when coming back online (catches missed updates).
  reloadOnOnline: true,

  // No service worker in development — avoids stale cache confusion during coding.
  disable: process.env.NODE_ENV === "development",

  workboxOptions: {
    // Don't auto-refresh — our Zustand state is ephemeral (not persisted to localStorage).
    // An auto-refresh mid-document would wipe all form data the user has entered.
    // Instead, the PwaUpdateBanner component shows a "Update when ready" toast,
    // and posts SKIP_WAITING only when the user explicitly clicks "Update".
    skipWaiting: false,
  },
})(nextConfig);
