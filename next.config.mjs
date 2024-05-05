/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "marketplace-production-ccd0.up.railway.app",
      },
    ],
  },
};

export default nextConfig;

/*
remotePatterns: [
      {
        protocol: "http",
        hostname: ["localhost"],
        port: "",
        pathname: "/media/",
        // pathname: "/account123/**",
      },
    ],
    */
