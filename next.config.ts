import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  /* config options here */
  //   images: {
  //   unoptimized: true, // Tạm thời disable optimization
  // },
};

export default nextConfig;
