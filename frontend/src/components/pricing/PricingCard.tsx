"use client"
import Box from '@mui/material/Box';
import React, { FC } from 'react';
import PricingTab from './PricingTab';
import { useBillingStore } from '@/utils/PricingPage';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const PricingCard: FC = () => {
    const { billingType, setBillingType } = useBillingStore();
    const { theme } = useTheme();

    return (
        <Box className="container mx-auto md:p-6 pb-24 relative z-20">
            {/* Billing Toggle - Modernized */}

            {/* Billing Toggle */}
            <div className="flex flex-col items-center justify-center gap-6 mb-16">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit backdrop-blur-sm">
                    <button
                        onClick={() => setBillingType('monthly')}
                        className={`relative px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl ${
                            billingType === 'monthly' 
                            ? 'text-white' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {billingType === 'monthly' && (
                            <motion.div 
                                layoutId="billing-pill"
                                className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">Monthly</span>
                    </button>
                    <button
                        onClick={() => setBillingType('yearly')}
                        className={`relative px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl ${
                            billingType === 'yearly' 
                            ? 'text-white' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {billingType === 'yearly' && (
                            <motion.div 
                                layoutId="billing-pill"
                                className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">Yearly</span>
                    </button>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-full shadow-sm"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">Save 20% with yearly billing</span>
                </motion.div>
            </div>

            <PricingTab billingType={billingType} setBillingType={setBillingType} />
        </Box>
    );
};

export default PricingCard;
