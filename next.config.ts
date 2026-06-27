import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/uprava",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
