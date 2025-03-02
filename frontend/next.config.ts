import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,  // Removes build activity icon
  },
  images: {
    domains: ['localhost','dummyimage.com'], // Allow images from localhost
  },
};

export default nextConfig;
