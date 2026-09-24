import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {

    remotePatterns: [

      {
        protocol: "https",
        hostname: "getvantage.co",
      },
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
      },
      {
        protocol: "https",
        hostname: "aicdn.picsart.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "www.chittorgarh.net",
      },
      {
        protocol: "https",
        hostname: "www.careinsurance.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "richharbor.s3.us-east-1.amazonaws.com",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
