import type { NextConfig } from "next";

// Centralize backend URL via env var
const API_SERVER = process.env.API_SERVER || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/metrics",
        destination: `${API_SERVER}/api/metrics`,
      },
      {
        source: "/api/predict",
        destination: `${API_SERVER}/api/predict`,
      },
      // catch-all route if more endpoints are added later
      {
        source: "/api/:path*",
        destination: `${API_SERVER}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
