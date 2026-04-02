/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "api.dicebear.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@react-pdf/renderer", "@react-pdf/pdfkit", "yoga-layout"],
};

module.exports = nextConfig;
