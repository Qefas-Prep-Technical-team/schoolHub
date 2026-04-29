"use client"
import React, { FC } from 'react';
import Box from '@mui/material/Box';
import FeaturesHero from './components/FeaturesHero';
import AcademicManagement from './components/AcademicManagement';
import CommunicationHub from './components/CommunicationHub';
import FinancialSuite from './components/FinancialSuite';
import BentoGrid from './components/BentoGrid';
import FinalCTA from './components/FinalCTA';

const FeaturesPage: FC = () => {
    return (
        <Box component="main" className="bg-white dark:bg-slate-950">
            <FeaturesHero />
            <AcademicManagement />
            <CommunicationHub />
            <FinancialSuite />
            <BentoGrid />
            <FinalCTA />
        </Box>
    );
};

export default FeaturesPage;
