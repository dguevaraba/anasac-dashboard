import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@anasac/shared"],
  async redirects() {
    return [{ source: "/swimmers", destination: "/nadadores", permanent: true }];
  },
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
