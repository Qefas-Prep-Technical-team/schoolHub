"use client"
import Features from "@/components/Home/Features";
import FrequentlyAskedQuestion from "@/components/Home/FrequentlyAskedQuestion";
import InAction from "@/components/Home/InAction";
import IntroSection from "@/components/Home/IntroSection";
import KeyBenefits from "@/components/Home/KeyBenefits";
import UsersSay from "@/components/Home/UsersSay";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from "react";


export default function Home() {
  const [queryClient] = useState(() => new QueryClient());
 
  return (
    <QueryClientProvider client={queryClient}>
      <Box component={"main"} className="min-h-screen flex items-center flex-col justify-center bg-white dark:bg-black text-black dark:text-gray-200 transition-all duration-300">
        <IntroSection />
        <Container maxWidth="xl" className="mt-10 mb-10" component={"section"}>
          <KeyBenefits />
          <Features />
          <UsersSay />
          <InAction />
          <FrequentlyAskedQuestion />
        </Container>
      </Box>
    </QueryClientProvider>
  );
}
