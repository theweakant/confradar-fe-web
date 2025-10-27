import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    unoptimized: true, // Tạm thời disable optimization
  },
  /* config options khác nếu có */
};

export default nextConfig;
