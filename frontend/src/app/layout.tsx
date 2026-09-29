/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/reusable/NavBar";
import { ThemeClientProvider } from "@/context/ThemeClientProvider";
import Footer from "@/components/reusable/Footer";
import Providers from "@/utils/providers";
import { ThemedTopLoader } from '@/components/reuseables/ThemedTopLoader';
import AppInitializer from "@/utils/AppInitializer";
import AuthModal from "@/components/reusable/AuthModal";
import AIChatWidget from "@/components/Home/AIChatWidget";
import { GlobalLogoutModal } from "@/components/ui/GlobalLogoutModal";

export const metadata: Metadata = {
  metadataBase: new URL('https://qefashub.com'),
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
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* <!-- Primary Meta Tags --> */}
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
          suppressHydrationWarning
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.44/dist/katex.min.css"
          crossOrigin="anonymous"
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Qefas Hub",
              url: "https://qefashub.com",
              logo: "https://qefashub.com/logo.png",
              sameAs: [
                "https://www.facebook.com/qefashub",
                "https://www.instagram.com/qefashub",
                "https://www.linkedin.com/company/qefashub",
                "https://twitter.com/qefashub"
              ]
            })
          }}
        />
      </head>
      <body
        className={`
          ${lexend.variable}
          antialiased
          text-[14.5px]
          `}
        suppressHydrationWarning
      >
        <Providers>

          <ThemeClientProvider>
            <AppInitializer>

              <NavBar />
              <AuthModal />
              <GlobalLogoutModal />
              <ThemedTopLoader />
              {children}
              <Footer />
              <AIChatWidget />
            </AppInitializer>
          </ThemeClientProvider>
        </Providers>
      </body>
    </html>
  );
}
