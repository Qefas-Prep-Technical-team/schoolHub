import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans, Roboto, Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/reusable/NavBar";
import { ThemeClientProvider } from "@/context/ThemeClientProvider";
import Footer from "@/components/reusable/Footer";
import 'leaflet/dist/leaflet.css';
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";
import Providers from "@/utils/providers";
import NextTopLoader from 'nextjs-toploader';
import AppInitializer from "@/utils/AppInitializer";
import AuthModal from "@/components/reusable/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Qefas Hub – Smart Academic Management',
  description: 'An all-in-one SaaS for modern schools, students, and parents to achieve academic excellence.',
  icons: {
    icon: './favicon.ico',
    apple: './apple-touch-icon.png',
  },
  openGraph: {
    title: 'Qefas Hub – Empowering Education',
    description: 'Manage academic operations with ease.',
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

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
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
        <title>Qefas Hub – Smart Academic Management</title>
        <meta name="title" content="Qefas Hub – Smart Academic Management" />
        <meta name="description" content="An all-in-one SaaS for modern schools, students, and parents to achieve academic excellence." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.44/dist/katex.min.css"
          crossOrigin="anonymous"
        />



        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qefashub.com" />
        <meta property="og:title" content="Qefas Hub – Empowering Education" />
        <meta property="og:description" content="An all-in-one SaaS for modern schools, students, and parents to achieve academic excellence." />
        <meta property="og:image" content="/meta-image.png" />

        {/* <!-- X (Twitter) --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://qefashub.com" />
        <meta property="twitter:title" content="Qefas Hub – Empowering Education" />
        <meta property="twitter:description" content="An all-in-one SaaS for modern schools, students, and parents to achieve academic excellence." />
        <meta property="twitter:image" content="/meta-image.png" />

        {/* <!-- Meta Tags Generated with https://metatags.io --> */}
      </head>
      <body
        className={`
          ${inter.variable} 
          ${notoSans.variable} 
          ${roboto.variable} 
          ${lexend.variable}
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased
          `}
        suppressHydrationWarning
      >
        <Providers>

          <ThemeClientProvider>
            <AppInitializer>

              <NavBar />
              <AuthModal />
              <NextTopLoader showSpinner={false} />
              {children}
              <Footer />
            </AppInitializer>


          </ThemeClientProvider>
        </Providers>
      </body>
    </html>
  );
}
