"use client";
import { currentName } from '@/utils/data';
import React, { FC } from 'react';
import { motion } from 'framer-motion';

const HeroSection: FC = () => {
    return (
        <section className="relative">
            <div className="flex flex-col items-center justify-center gap-6 text-center max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-slate-900 dark:text-white text-6xl md:text-7xl font-black leading-[1.1] tracking-tight font-lexend">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">{currentName}</span> ecosystem
                    </h1>
                </motion.div>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed"
                >
                    Experience the future of institutional management. Select your role to embark on your digital journey.
                </motion.p>
            </div>
        </section>
    );
};

export default HeroSection;
