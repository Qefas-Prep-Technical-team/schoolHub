"use client";
import React, { FC, useState } from 'react';
import { PricingTab } from '../Types/Pricing';
import { useBillingStore } from '@/utils/PricingPage';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, Rocket, Loader2 } from 'lucide-react';
import { useAuthModalStore } from '@/utils/AuthModalStore';

interface EachPriceCardProps extends PricingTab {
    category?: string;
    index?: number;
}

const EachPriceCard: FC<EachPriceCardProps> = ({ name, description, pricing, type, trialDays, features, hasTrial, isPopular, category, index = 0 }) => {
    const { theme } = useTheme();
    const { billingType } = useBillingStore();
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const amount = billingType === 'monthly' ? pricing?.monthly : pricing?.yearly;

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        const lowerCategory = category?.toLowerCase() || '';
        const lowerType = type.toLowerCase();
        
        let role = 'STUDENT';
        if (lowerCategory === 'schools') role = 'ADMIN';
        else if (lowerCategory === 'teachers') role = 'TEACHER';
        else if (lowerCategory === 'individuals') {
            if (lowerType.includes('parent')) role = 'PARENT';
        }

        const queryParams = new URLSearchParams({
            plan: type,
            billing: billingType,
            role: role
        });

        setIsLoading(true);
        router.push(`/checkout?${queryParams.toString()}`);
    };

    // Icon mapping based on plan type
    const getIcon = () => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('starter') || lowerType.includes('student')) return <Rocket className="w-6 h-6 text-blue-500" />;
        if (lowerType.includes('growth') || lowerType.includes('pro')) return <Zap className="w-6 h-6 text-orange-500" />;
        if (lowerType.includes('enterprise')) return <Shield className="w-6 h-6 text-purple-500" />;
        return <Rocket className="w-6 h-6 text-blue-500" />;
    };

    // Bento Grid styling: Make the middle/popular card stand out structurally
    const bentoLayoutClass = isPopular || index === 1 
        ? "lg:-mt-8 lg:mb-8 lg:scale-105 z-10" 
        : "mt-0 z-0";

    return (
        <motion.div 
            whileHover={{ y: -10, scale: isPopular || index === 1 ? 1.06 : 1.02 }}
            onClick={handleAction}
            className={`group relative flex flex-col rounded-[3rem] border p-8 transition-all duration-500 overflow-hidden cursor-pointer ${bentoLayoutClass} ${
                isPopular 
                ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10 shadow-2xl shadow-blue-500/20' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xl shadow-slate-200/50 dark:shadow-none'
            }`}
        >
            {/* Background Decorations */}
            {isPopular && (
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-500"></div>
            )}

            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/30">
                        Most Popular
                    </span>
                </div>
            )}

            <div className="flex-grow relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 rounded-2xl ${isPopular ? 'bg-blue-600/10 dark:bg-blue-600/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize leading-tight">{type}</h3>
                        {hasTrial && <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Free {trialDays}-day trial</span>}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">₦{amount?.toLocaleString()}</span>
                        <span className="text-lg font-bold text-slate-500 dark:text-slate-400">/{billingType === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-8"></div>

                <ul className="space-y-4">
                    {features?.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 group/item">
                            <div className="mt-1 flex-shrink-0">
                                <CheckCircle2 className={`w-5 h-5 ${isPopular ? 'text-blue-600' : 'text-green-500'} transition-transform group-hover/item:scale-110`} />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium leading-snug">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <button 
                onClick={handleAction}
                disabled={isLoading}
                className={`mt-10 relative group/btn w-full overflow-hidden rounded-2xl py-4 text-lg font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPopular 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/50 active:scale-95 disabled:bg-blue-400' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 disabled:opacity-70'
                }`}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <span className="relative z-10">{isAuthenticated ? 'Upgrade Now' : (hasTrial ? `Start ${trialDays}-Day Free Trial` : "Get Started")}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            </button>

        </motion.div>
    );
};

export default EachPriceCard;