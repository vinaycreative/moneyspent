import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Cache control for production
  reactStrictMode: false,
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
      // Cache control for auth routes
      {
        source: "/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
        ],
      },
    ]
  },
}

export default nextConfig
