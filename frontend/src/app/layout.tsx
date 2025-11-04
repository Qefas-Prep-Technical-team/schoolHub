import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/reusable/NavBar";
import { ThemeClientProvider } from "@/context/ThemeClientProvider";
import Footer from "@/components/reusable/Footer";
import 'leaflet/dist/leaflet.css';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'SchoolHub – Smart School Management',
  description: 'An all-in-one SaaS for modern schools, students, and parents.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SchoolHub – Empowering Schools',
    description: 'Manage school operations with ease.',
    images: ['/meta-image.png'],
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <!-- Primary Meta Tags --> */}
        <title>SchoolHub Landing Page</title>
        <meta name="title" content="SchoolHub Landing Page" />
        <meta name="description" content="A landing page for SchoolHub" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />



        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://school-hub-staging.vercel.app/" />
        <meta property="og:title" content="SchoolHub Landing Page" />
        <meta property="og:description" content="A landing page for SchoolHub" />
        <meta property="og:image" content="/backImage.jpeg" />

        {/* <!-- X (Twitter) --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://school-hub-staging.vercel.app/" />
        <meta property="twitter:title" content="SchoolHub Landing Page" />
        <meta property="twitter:description" content="A landing page for SchoolHub" />
        <meta property="twitter:image" content="/backImage.jpeg" />

        {/* <!-- Meta Tags Generated with https://metatags.io --> */}
      </head>
      <body
        className={`
          ${inter.variable} 
    ${notoSans.variable} 
    ${roboto.variable} 
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased
          `}
      >
        <ThemeClientProvider>
          <NavBar />
          {children}
          <Footer />
        </ThemeClientProvider>
      </body>
    </html>
  );
}
