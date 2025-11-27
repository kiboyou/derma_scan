import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/metrics",
        destination: "http://localhost:8000/api/metrics",
      },
      {
        source: "/api/predict",
        destination: "http://localhost:8000/api/predict",
      },
    ];
  },
};

export default nextConfig;
