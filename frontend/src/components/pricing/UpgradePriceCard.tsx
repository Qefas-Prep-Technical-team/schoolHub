"use client";
import React, { FC, useState } from 'react';
import { PricingTab as PricingTabType } from '../Types/Pricing';
import { useBillingStore } from '@/utils/PricingPage';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Shield, Rocket, Loader2, Cloud, ArrowRight, Sparkles } from 'lucide-react';
import { useCheckoutStore } from '@/utils/CheckoutStore';
import { calculateProRatedAmount } from '@/utils/pricingUtils';

interface UpgradePriceCardProps extends PricingTabType {
    category?: string;
    index?: number;
    currentPlan?: string;
    currentPlanPrice?: number;
    lastPaymentDate?: string | Date | null;
}

const UpgradePriceCard: FC<UpgradePriceCardProps> = ({ 
    name, description, pricing, type, trialDays, features, hasTrial, isPopular, category, index = 0,
    storage, currentPlan, currentPlanPrice, lastPaymentDate
}) => {
    const { billingType } = useBillingStore();
    const { isAuthenticated, user } = useAuthStore();
    const { setCheckoutDetails } = useCheckoutStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const amount = billingType === 'monthly' ? pricing?.monthly : pricing?.yearly;
    
    const planOrder: Record<string, number> = {
        'free': 0,
        'starter': 1,
        'growth': 2,
        'pro': 3
    };

    const currentPlanLevel = planOrder[user?.plan?.toLowerCase() || 'free'] ?? 0;
    const targetPlanLevel = planOrder[type?.toLowerCase() || 'free'] ?? 0;
    const isLowerPlan = targetPlanLevel < currentPlanLevel;

    // Logic to check if this is the current plan - use prop for real-time accuracy
    const isCurrentPlan = isAuthenticated && 
        (currentPlan?.toLowerCase() === type?.toLowerCase() || user?.plan?.toLowerCase() === type?.toLowerCase());

    const isDeactivated = isLowerPlan && !isCurrentPlan;

    const proRata = amount && currentPlanPrice 
        ? calculateProRatedAmount(currentPlanPrice, amount, lastPaymentDate || null, billingType)
        : { amount: amount || 0, isUpgrade: false };

    const handleAction = (e: React.MouseEvent) => {
        if (isCurrentPlan || isDeactivated) return;
        e.stopPropagation();
        
        setCheckoutDetails({
            plan: type,
            billing: billingType,
            role: 'ADMIN', // Upgrade flow is for school admins
            discountedAmount: proRata.amount,
            isUpgrade: proRata.isUpgrade
        });

        setIsLoading(true);
        router.push(`/checkout`);
    };

    const getIcon = () => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('starter')) return <Rocket className="w-6 h-6 text-blue-500" />;
        if (lowerType.includes('growth')) return <Zap className="w-6 h-6 text-amber-500" />;
        return <Shield className="w-6 h-6 text-indigo-500" />;
    };

    return (
        <motion.div 
            whileHover={(!isCurrentPlan && !isDeactivated) ? { y: -12, scale: 1.02 } : {}}
            onClick={handleAction}
            className={`group relative flex flex-col rounded-[3rem] border-2 transition-all duration-500 w-full h-full min-h-[650px] ${
                isCurrentPlan 
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-70 grayscale-[0.5] cursor-not-allowed pointer-events-none' 
                : isDeactivated
                ? 'border-slate-100 dark:border-slate-800/30 bg-slate-100/20 dark:bg-slate-900/10 opacity-40 grayscale cursor-not-allowed pointer-events-none'
                : isPopular 
                ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-2xl cursor-pointer' 
                : 'border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl cursor-pointer'
            }`}
        >
            {/* Active Plan Indicator */}
            {isCurrentPlan && (
                <div className="absolute top-8 right-8 z-30">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                        Active
                    </div>
                </div>
            )}
            <div className="flex-grow p-10 relative z-10 flex flex-col">
                {/* Header */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${
                        isPopular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                        {getIcon()}
                    </div>
                    
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white capitalize mb-2 tracking-tight">
                            {name || type}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed line-clamp-2">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Pricing Area */}
                <div className="mb-10 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-black text-slate-400">₦</span>
                        <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                            {proRata.amount.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                            /{billingType === 'monthly' ? 'mo' : 'yr'}
                        </span>
                    </div>
                    {proRata.isUpgrade ? (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-widest animate-pulse">Pro-rated Price</span>
                            <span className="text-[10px] font-bold text-slate-400">Saved for current plan</span>
                        </div>
                    ) : isCurrentPlan ? (
                        <div className="text-[10px] font-bold text-blue-500 mt-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            <span>Your current active subscription price</span>
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold text-slate-400 mt-2">Full pricing (Billing Reset)</div>
                    )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-10">
                    {features?.slice(0, 5).map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPopular ? 'text-blue-500' : 'text-slate-400'}`} />
                            <span className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-snug">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800/50">
                    <button 
                        onClick={handleAction}
                        disabled={isLoading || isCurrentPlan || isDeactivated}
                        className={`w-full py-5 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-2 ${
                            (isCurrentPlan || isDeactivated)
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : isPopular 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700' 
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'
                        }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <span>{isCurrentPlan ? 'Current Active Plan' : isDeactivated ? 'Already Upgraded' : 'Select This Plan'}</span>
                                {!isCurrentPlan && !isDeactivated && <ArrowRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default UpgradePriceCard;
