"use client"
import Features from '@/components/features/Features';
import HeroHead from '@/components/features/HeroHead';
import Box from '@mui/material/Box';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { FC, useState } from 'react';
import { QueryClient } from '@tanstack/react-query';

const FeatursPage: FC = () => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            <Box component="main" className="container mx-auto px-6 py-16 flex flex-col items-center">
                <HeroHead />
                <Features />
            </Box>
        </QueryClientProvider>
    );
};

export default FeatursPage;