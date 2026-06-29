"use client"
import Features from "@/components/Home/Features";
import FrequentlyAskedQuestion from "@/components/Home/FrequentlyAskedQuestion";
import InAction from "@/components/Home/InAction";
import IntroSection from "@/components/Home/IntroSection";
import KeyBenefits from "@/components/Home/KeyBenefits";
import UsersSay from "@/components/Home/UsersSay";
import MobileExperience from "@/components/Home/MobileExperience";
import StatsSection from "@/components/Home/StatsSection";
import FinalCTA from "@/components/Home/FinalCTA";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from "react";
import { motion, useScroll } from "framer-motion";
import AIChatWidget from "@/components/Home/AIChatWidget";

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());
  const { scrollYProgress } = useScroll();
 
  return (
    <QueryClientProvider client={queryClient}>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#111827] z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      {/* dashdesign01 "Lumina Finance" — light lavender-white / dark navy base */}
      <main className="min-h-screen bg-[#fcf8ff] dark:bg-[#0a0f1e] text-[#1a1a2b] dark:text-white overflow-x-hidden transition-colors duration-300">
        {/* Hero — split layout with dashboard mockup */}
        <IntroSection />
        
        {/* Partner strip + Platform highlights with phone mockup */}
        <KeyBenefits />

        {/* Stats bar — dark navy band */}
        <StatsSection />

        {/* Mobile app CTA — phone + watch devices */}
        <MobileExperience />

        {/* Features bento grid */}
        <Features />

        {/* Testimonials — white cards */}
        <UsersSay />

        {/* Video showcase */}
        <InAction />

        {/* FAQ */}
        <FrequentlyAskedQuestion />

        {/* Final dark CTA */}
        <FinalCTA />

        {/* Qefas Hub Support AI Chat */}
        <AIChatWidget />
      </main>
    </QueryClientProvider>
  );
}
