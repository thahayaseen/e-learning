import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  devIndicators: {
    buildActivity: false, // Removes build activity icon
  },
  images: {
     remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thahtib-al-juhd.s3.ap-south-2.amazonaws.com',
      },
    ],
    // domains: [
    //   "localhost",
    //   "lh3.googleusercontent.com",
    //   "exi-elarning.s3.ap-south-1.amazonaws.com",
    //   "thahtib-al-juhd.s3.ap-south-2.amazonaws.com"
    // ], // Allow images from localhost
    
  },
};

export default nextConfig;
