"use client"
import Features from "@/components/Home/Features";
import FrequentlyAskedQuestion from "@/components/Home/FrequentlyAskedQuestion";
import InAction from "@/components/Home/InAction";
import IntroSection from "@/components/Home/IntroSection";
import KeyBenefits from "@/components/Home/KeyBenefits";
import UsersSay from "@/components/Home/UsersSay";
import MobileExperience from "@/components/Home/MobileExperience";
import FinalCTA from "@/components/Home/FinalCTA";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from "react";
import { motion, useScroll } from "framer-motion";

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());
  const { scrollYProgress } = useScroll();
 
  return (
    <QueryClientProvider client={queryClient}>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden noise-bg">
        {/* Hero Section */}
        <IntroSection />
        
        {/* Institutional Partners & Value Props */}
        <KeyBenefits />

        {/* Mobile Experience Showcase */}
        <MobileExperience />

        {/* Features Grid */}
        <Features />

        {/* Testimonials */}
        <UsersSay />

        {/* Video Showcase */}
        <InAction />

        {/* FAQ Section */}
        <FrequentlyAskedQuestion />

        {/* Final CTA Section */}
        <FinalCTA />
      </main>
    </QueryClientProvider>
  );
}
