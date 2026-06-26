import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // In dev the media files are served by the local Django backend over plain
    // HTTP. The browser loads them directly from localhost:8000; running them
    // through the Next.js optimizer adds no value here and breaks in Docker
    // (the optimizer fetches server-side, where the host differs). Optimize in
    // production, where a real public media domain belongs in `remotePatterns`.
    unoptimized: process.env.NODE_ENV !== "production",
    // Production media host / CDN domain — add the real one when deploying.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
