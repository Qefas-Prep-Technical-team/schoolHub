"use client"
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PricingTab from '@/components/pricing/PricingTab';
import { useBillingStore } from '@/utils/PricingPage';
import { motion } from 'framer-motion';

function SelectPlanContent() {
    const { billingType, setBillingType } = useBillingStore();

    return (
        <Box component={"main"} className='flex min-h-screen w-full items-center justify-start flex-col overflow-x-hidden pt-24 bg-slate-50 dark:bg-slate-950'>
            
            <div className="text-center w-full max-w-3xl mx-auto px-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                    Select Your Subscription Plan
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    Choose the plan that best fits your school's needs. You can start with our Free plan or upgrade to unlock premium features.
                </p>

                {/* Billing Toggle */}
                <div className="flex flex-col items-center justify-center gap-6 mb-8">
                    <div className="flex items-center bg-white dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit backdrop-blur-sm shadow-sm">
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
                                    layoutId="billing-pill-setup"
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
                                    layoutId="billing-pill-setup"
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
            </div>

            <Box className="w-full container mx-auto md:p-6 pb-24 relative z-20">
                <PricingTab billingType={billingType} setBillingType={setBillingType} isSetupMode={true} />
            </Box>
        </Box>
    );
}

export default function SelectPlanPage() {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <SelectPlanContent />
        </QueryClientProvider>
    );
}
