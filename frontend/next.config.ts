/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "api.dicebear.com", "schoolhub-q.b-cdn.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "schoolhub-q.b-cdn.net",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@react-pdf/renderer", "@react-pdf/pdfkit", "yoga-layout"],
};

module.exports = nextConfig;
