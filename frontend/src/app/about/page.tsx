import CoreValues from '@/components/About/CoreValues';
import HeroSection from '@/components/About/HeroSection';
import OurTeam from '@/components/About/OurTeam';
import VisionStory from '@/components/About/VisionStory';
import { Container } from '@mui/material';
import React, { FC } from 'react';

const AboutPage: FC = () => {
    return (
        <main className='flex h-full w-full items-center justify-center flex-col'>
            <HeroSection />
            <Container maxWidth="xl" component={"section"} >
                <VisionStory />
                <OurTeam />
                <CoreValues />
            </Container>
        </main>
    );
};

export default AboutPage;