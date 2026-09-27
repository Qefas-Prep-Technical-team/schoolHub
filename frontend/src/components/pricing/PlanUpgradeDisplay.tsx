"use client";
import React from 'react';
import UpgradeExplanation from './UpgradeExplanation';
import { motion } from 'framer-motion';
import UpgradePriceCard from './UpgradePriceCard';
import PlanComparisonTable from './PlanComparisonTable';
import { useFetchPricing } from './query';
import { useBillingStore } from '@/utils/PricingPage';

interface PlanUpgradeDisplayProps {
    currentPlan?: string;
    currentPlanId?: string;
    currentBillingCycle?: string;
    isUpgradeFlow?: boolean;
    currentPlanPrice?: number;
    lastPaymentDate?: string | Date | null;
}

export default function PlanUpgradeDisplay({
    currentPlan,
    currentPlanId,
    currentBillingCycle,
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
            <div className="mb-16 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 inline-block">
                    PRICING
                </span>
                <h2 className="text-4xl md:text-[2.5rem] font-medium text-slate-900 dark:text-white mb-4 tracking-tight leading-none">
                    Simple, Transparent Pricing
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
                    Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward pricing for powerful financial management.
                </p>
            </div>

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

            {/* Horizontal Scroll Area for Upgrade Cards */}
            <div className="relative w-full max-w-6xl mx-auto pb-20">
                {isLoading ? (
                    <div className="flex gap-4 justify-center">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full max-w-sm h-[500px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
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
                                    currentPlanId={currentPlanId}
                                    currentBillingCycle={currentBillingCycle}
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

            {/* Detailed Feature Comparison Table */}
            <PlanComparisonTable plans={filteredData?.tabs || []} />
        </div>
    );
}
