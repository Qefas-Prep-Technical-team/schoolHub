"use client";
import React from 'react';
import UpgradeExplanation from './UpgradeExplanation';
import { motion } from 'framer-motion';
import UpgradePriceCard from './UpgradePriceCard';
import { useFetchPricing } from './query';
import { useBillingStore } from '@/utils/PricingPage';

interface PlanUpgradeDisplayProps {
    currentPlan?: string;
    isUpgradeFlow?: boolean;
    currentPlanPrice?: number;
    lastPaymentDate?: string | Date | null;
}

export default function PlanUpgradeDisplay({
    currentPlan,
    currentPlanPrice,
    lastPaymentDate
}: PlanUpgradeDisplayProps) {
    const { billingType, setBillingType } = useBillingStore();
    const { data: pricingData, isLoading } = useFetchPricing();
    
    // Only show school plans for upgrade flow (School Admins)
    const filteredData = pricingData?.find(d => d.category === 'schools');

    return (
        <div className="w-full">
            {/* Header section specifically for upgrades */}
            <div className="mb-14 text-center md:text-left">
                <span className="px-5 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-[0.3em] mb-6 inline-block shadow-sm">
                    Upgrade Selection
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none">
                    Power up your school with a better plan
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-3xl leading-relaxed">
                    Choose an upgrade that fits your growing needs. We&apos;ve simplified the transition with our pro-rated pricing model, ensuring you only pay for what you value.
                </p>
            </div>

            {/* Explanation Component */}
            <UpgradeExplanation />

            {/* Billing Toggle */}
            <div className="flex justify-center md:justify-start mb-12">
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <button
                        onClick={() => setBillingType('monthly')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
                            billingType === 'monthly' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingType('yearly')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all relative ${
                            billingType === 'yearly' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Yearly
                        <span className="absolute -top-3 -right-4 px-2 py-0.5 bg-green-500 text-white text-[8px] font-black rounded-full shadow-lg uppercase tracking-tight">Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Area for Upgrade Cards - Semi-Stacked Version */}
            <div className="relative w-full overflow-visible py-20 px-4">
                {isLoading ? (
                    <div className="flex gap-4 justify-center">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-[420px] h-[650px] rounded-[3rem] bg-slate-100 dark:bg-slate-800 animate-pulse border-2 border-slate-200 dark:border-slate-800" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredData?.tabs.map((plan, index) => (
                            <motion.div 
                                key={plan.type} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="w-full"
                            >
                                <UpgradePriceCard 
                                    {...plan}
                                    index={index}
                                    currentPlan={currentPlan}
                                    currentPlanPrice={currentPlanPrice}
                                    lastPaymentDate={lastPaymentDate}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Navigation hint */}
                <div className="mt-12 flex justify-center items-center gap-4 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">
                    <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                    <span>Hover to Expand Plan</span>
                    <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        </div>
    );
}
