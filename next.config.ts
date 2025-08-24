import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Cache control for production
  generateEtags: false,

  // Headers for security and caching control
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Cache control for auth-sensitive routes
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      // Specific cache control for private routes
      {
        source: "/(dashboard|transactions|analytics|accounts|settings)(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
        ],
      },
      // Prevent service worker caching for auth routes
      {
        source: "/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
          {
            key: "Service-Worker-Allowed",
            value: "none",
          },
        ],
      },
      // Prevent service worker caching for the cleanup script
      {
        source: "/sw-cleanup.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ]
  },
}

export default nextConfig
