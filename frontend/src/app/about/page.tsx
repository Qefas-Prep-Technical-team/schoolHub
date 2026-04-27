"use client"
import React, { FC } from 'react';
import Box from '@mui/material/Box';
import AboutHero from './components/AboutHero';
import MissionVision from './components/MissionVision';
import OurStory from './components/OurStory';
import CoreValues from './components/CoreValues';
import AboutCTA from './components/AboutCTA';

const AboutPage: FC = () => {
    return (
        <Box component="main" className="bg-white dark:bg-slate-950">
            <AboutHero />
            <MissionVision />
            <OurStory />
            <CoreValues />
            <AboutCTA />
        </Box>
    );
};

export default AboutPage;
