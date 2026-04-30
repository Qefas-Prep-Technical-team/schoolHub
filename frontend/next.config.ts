/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "api.dicebear.com",
      "schoolhub-q.b-cdn.net",
      "ui-avatars.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "schoolhub-q.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@react-pdf/renderer", "@react-pdf/pdfkit", "yoga-layout"],
};

module.exports = nextConfig;
