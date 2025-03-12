import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,  // Removes build activity icon
  },
  images: {
    domains: ['localhost','dummyimage.com','exi-elarning.s3.ap-south-1.amazonaws.com'], // Allow images from localhost
  },
};

export default nextConfig;
