import Box from '@mui/material/Box';
import React, { FC } from 'react';

const HeroSection: FC = () => {
    return (
        <Box className="text-center  jusify-center align-center mt-40">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">Simple, transparent pricing</h1>
            <p className="mt-4 text-lg sm:text-xl text-[var(--text-secondary)] w-3/4 mx-auto">Find the right plan for your school. Start with a free 14-day trial.</p>
        </Box>
    );
};

export default HeroSection;