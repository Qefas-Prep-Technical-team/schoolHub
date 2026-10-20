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
import { useState, useEffect, Suspense } from "react";
import { motion, useScroll } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, resolveUserDashboard } from "@/app/(auth)/login/services/auth-store";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { scrollYProgress } = useScroll();
  const { isAuthenticated, userType, user, isInitialized, isLoggingOut } = useAuthStore();
  const { isAuthenticated: isStaffAuth, staff } = usePlatformStaffStore();
  const viewMode = searchParams.get("view");

  const isRedirectingToDashboard =
    viewMode !== "landing" &&
    !isLoggingOut &&
    ((isInitialized && isAuthenticated) || isStaffAuth);

  useEffect(() => {
    // If navigating with ?view=landing (e.g. clicked dashboard sidebar logo), allow viewing landing page
    if (viewMode === "landing" || isLoggingOut) {
      return;
    }

    if (isStaffAuth && staff) {
      router.replace("/console");
      return;
    }

    if (!isInitialized) return;

    if (isAuthenticated) {
      const targetDashboard = resolveUserDashboard(user, userType);
      router.replace(targetDashboard);
    }
  }, [isAuthenticated, userType, user, isInitialized, isLoggingOut, isStaffAuth, staff, viewMode, router]);

  if (isRedirectingToDashboard) {
    return (
      <div className="min-h-screen bg-[#fcf8ff] dark:bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
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
      </main>
    </>
  );
}

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="min-h-screen bg-[#fcf8ff] dark:bg-[#0a0f1e]" />}>
        <LandingContent />
      </Suspense>
    </QueryClientProvider>
  );
}
