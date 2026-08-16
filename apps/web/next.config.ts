import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@anasac/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alonsoviales.s3.amazonaws.com",
        pathname: "/anasac/**",
      },
    ],
  },
};

export default nextConfig;
