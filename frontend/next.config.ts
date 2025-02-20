import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,  // Removes build activity icon
  },
  images: {
    domains: ['localhost'], // Allow images from localhost
  },
};

export default nextConfig;
