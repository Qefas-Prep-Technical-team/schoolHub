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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Pravatar — used in Pricing page HeroSection avatars
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        // GitHub avatars
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        // Cloudflare image delivery
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        // Supabase storage
        protocol: "https",
        hostname: "khogvaepivbqzlqndedv.supabase.co",
      },
    ],
  },
  transpilePackages: ["@react-pdf/renderer", "@react-pdf/pdfkit", "yoga-layout"],
  async rewrites() {
    return [
      {
        source: "/dashboard/student/exams/:path*",
        destination: "/dashboard/student/exams&quizzes/:path*",
      },
      {
        source: "/dashboard/student/exams",
        destination: "/dashboard/student/exams&quizzes",
      },
    ];
  },
  experimental: {
  },
};

module.exports = nextConfig;
