/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
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
  transpilePackages: ["@react-pdf/renderer", "@react-pdf/pdfkit", "yoga-layout"],
  experimental: {
    // Silences the "Next.js inferred your workspace root" warning
    // Turbopack uses this to determine the root of the project
    turbopack: {
      root: "..",
    },
  },
};

module.exports = nextConfig;
