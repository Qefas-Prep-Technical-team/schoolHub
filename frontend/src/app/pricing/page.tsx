"use client"
import FrequentlyAskedQuestions from '@/components/pricing/FrequentlyAskedQuestions';
import HeroSection from '@/components/pricing/HeroSection';
import PricingCard from '@/components/pricing/PricingCard';
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { FC, useState } from 'react';

const PricingPage: FC = () => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <Box component={"main"} className='flex h-full items-center justify-center flex-col'>
                <HeroSection />
                <PricingCard />
                <FrequentlyAskedQuestions />
            </Box>
        </QueryClientProvider>
    );
};

export default PricingPage;