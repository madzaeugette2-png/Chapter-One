/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add your WordPress media host(s) here so next/image can optimize them,
    // e.g. { hostname: "cms.chapterone.com" }
    remotePatterns: [],
  },
};

module.exports = nextConfig;
