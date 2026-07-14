"use client";
import React, { FC, useState } from 'react';
import { PricingTab } from '../Types/Pricing';
import { useBillingStore } from '@/utils/PricingPage';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    CheckCircle2, Zap, Shield, Rocket, Loader2,
    Cloud, ArrowRight, Star, BadgeCheck
} from 'lucide-react';
import { useCheckoutStore } from '@/utils/CheckoutStore';

interface EachPriceCardProps extends PricingTab {
    category?: string;
    index?: number;
    isSetupMode?: boolean;
}

const EachPriceCard: FC<EachPriceCardProps> = ({
    name, description, pricing, type, trialDays, features, hasTrial,
    isPopular, category, index = 0, storage, isSetupMode = false
}) => {
    const { billingType } = useBillingStore();
    const { user, isAuthenticated } = useAuthStore();
    const { setCheckoutDetails } = useCheckoutStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const amount = billingType === 'monthly' ? pricing?.monthly : pricing?.yearly;
    const canUseTrial = hasTrial && (!isAuthenticated || !user?.trialUsed);

    const isCurrentPlan =
        isAuthenticated &&
        !!user?.plan &&
        user.plan.toLowerCase() === type?.toLowerCase() &&
        (user.billingCycle || 'monthly').toLowerCase() === billingType.toLowerCase();

    const isDeactivated = false; // Disable hierarchy-based deactivation per user request
    const isTrialPlan = isCurrentPlan && !!user?.trialUsed;

    const handleAction = (e: React.MouseEvent) => {
        if (isCurrentPlan || isDeactivated) return;
        e.stopPropagation();

        const lowerCategory = category?.toLowerCase() || '';
        const lowerType = type.toLowerCase();

        let role = 'STUDENT';
        if (lowerCategory === 'schools') role = 'ADMIN';
        else if (lowerCategory === 'teachers') role = 'TEACHER';
        else if (lowerCategory === 'parents') role = 'PARENT';
        else if (lowerCategory === 'individuals' && lowerType.includes('parent')) role = 'PARENT';

        // Custom redirection for Free plans for unauthenticated users
        if (lowerType === 'free' && !isAuthenticated) {
            let signupPath = '/signup';
            if (role === 'STUDENT') signupPath = '/signup/student';
            else if (role === 'TEACHER') signupPath = '/signup/teacher';
            else if (role === 'PARENT') signupPath = '/signup/parent';
            else if (role === 'ADMIN') signupPath = '/signup/school';
            
            setIsLoading(true);
            router.push(signupPath);
            return;
        }

        if (lowerType === 'free' && isSetupMode && isAuthenticated) {
            setIsLoading(true);
            // Hit the activate free plan API
            import('@/lib/api/client').then(({ apiClient }) => {
                apiClient.post('/subscription/activate-free-plan')
                    .then(() => {
                        const { updateUser } = useAuthStore.getState();
                        updateUser({ plan: 'FREE' }); // Update local state so it proceeds to onboarding
                        router.replace(`/onboarding?type=${role}`);
                    })
                    .catch((err: any) => {
                        console.error('Failed to activate free plan', err);
                        setIsLoading(false);
                    });
            });
            return;
        }

        const redirectBackUrl = window.location.pathname + window.location.search;
        setCheckoutDetails({ plan: type, billing: billingType, role, redirectBackUrl });
        setIsLoading(true);
        router.push('/checkout');
    };

    const getIcon = () => {
        const t = type.toLowerCase();
        if (t.includes('starter') || t.includes('student') || t.includes('essential'))
            return <Rocket className="w-5 h-5" />;
        if (t.includes('growth') || t.includes('professional'))
            return <Zap className="w-5 h-5" />;
        if (t.includes('pro') || t.includes('enterprise') || t.includes('team'))
            return <Shield className="w-5 h-5" />;
        return <Star className="w-5 h-5" />;
    };

    // ─── State Derivations ────────────────────────────────────────────────────
    const isHighlighted = isPopular && !isCurrentPlan;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden
                ${isCurrentPlan
                    ? 'border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-900 shadow-[0_0_0_4px_rgba(52,211,153,0.15)] ring-0'
                    : isDeactivated
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-50 grayscale pointer-events-none'
                    : isHighlighted
                    ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-900 shadow-[0_20px_60px_-10px_rgba(37,99,235,0.25)]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700'
                }
                ${!isCurrentPlan && !isDeactivated ? 'cursor-pointer' : ''}
            `}
            whileHover={!isCurrentPlan && !isDeactivated ? { y: -4 } : {}}
            onClick={handleAction}
        >
            {/* Top accent bar */}
            {(isCurrentPlan || isHighlighted) && (
                <div className={`h-1 w-full ${isCurrentPlan ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
            )}

            {/* Badge row */}
            <div className="flex items-center justify-between px-8 pt-8 pb-0 min-h-[40px]">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider
                    ${isCurrentPlan
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : isDeactivated 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-60'
                        : isHighlighted
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                >
                    <span className={isCurrentPlan ? 'text-emerald-500' : isDeactivated ? 'text-slate-400' : isHighlighted ? 'text-blue-500' : 'text-slate-400'}>
                        {getIcon()}
                    </span>
                    {isCurrentPlan
                        ? (isTrialPlan ? 'Trial Active' : 'Current Plan')
                        : isDeactivated
                        ? 'Not Available'
                        : isHighlighted
                        ? 'Most Popular'
                        : 'Standard'}
                </div>

                {isCurrentPlan && (
                    <BadgeCheck className="w-5 h-5 text-emerald-500" />
                )}
                {canUseTrial && !isCurrentPlan && (
                    <span className="text-[11px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full uppercase tracking-wide">
                        {trialDays}-day trial
                    </span>
                )}
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-grow px-8 pt-6 pb-8 gap-6">

                {/* Plan name & description */}
                <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white capitalize mb-1">
                        {name || type}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                    <span className="text-base font-black text-slate-400 dark:text-slate-500 mb-0.5">₦</span>
                    <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                        {amount === 0 ? 'Free' : amount?.toLocaleString()}
                    </span>
                    {amount !== 0 && (
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                            /{billingType === 'monthly' ? 'mo' : 'yr'}
                        </span>
                    )}
                </div>

                {/* Yearly savings badge */}
                {billingType === 'yearly' && amount !== 0 && (
                    <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest -mt-4">
                        ✦ Save 20% vs monthly
                    </p>
                )}

                {/* Divider */}
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

                {/* Storage */}
                {storage && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold
                        ${isCurrentPlan
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : isHighlighted
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        <Cloud className="w-4 h-4 flex-shrink-0" />
                        <span>{storage} Data Capacity</span>
                    </div>
                )}

                {/* Features (Marketing Labels Only) */}
                <ul className="space-y-3 flex-grow">
                    {features?.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0
                                ${isCurrentPlan
                                    ? 'text-emerald-500'
                                    : isHighlighted
                                    ? 'text-blue-500'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                            />
                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-snug">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* CTA Button */}
                <button
                    onClick={handleAction}
                    disabled={isLoading || isCurrentPlan || isDeactivated || (!isSetupMode && isAuthenticated && type.toLowerCase() === 'free')}
                    className={`relative w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden
                        ${(isCurrentPlan || isDeactivated || (!isSetupMode && isAuthenticated && type.toLowerCase() === 'free'))
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-not-allowed'
                            : isHighlighted
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-[0.98]'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 active:scale-[0.98]'
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {(isCurrentPlan || (!isSetupMode && isAuthenticated && type.toLowerCase() === 'free')) && <CheckCircle2 className="w-4 h-4" />}
                            <span>
                                {isCurrentPlan
                                    ? (isTrialPlan ? 'Trial Active' : 'Current Plan')
                                    : isDeactivated
                                    ? 'Existing Subscriber'
                                    : (!isSetupMode && isAuthenticated && type.toLowerCase() === 'free')
                                    ? 'Plan Unavailable'
                                    : (isSetupMode && isAuthenticated && type.toLowerCase() === 'free')
                                    ? 'Continue with Free'
                                    : canUseTrial
                                    ? `Start ${trialDays}-Day Free Trial`
                                    : amount === 0
                                    ? 'Get Started Free'
                                    : 'Get Started'}
                            </span>
                            {(!isCurrentPlan && !isDeactivated && !(!isSetupMode && isAuthenticated && type.toLowerCase() === 'free')) && <ArrowRight className="w-4 h-4" />}
                        </>
                    )}
                    {/* Shine sweep on hover for non-current non-disabled */}
                    {!isCurrentPlan && !isDeactivated && !(!isSetupMode && isAuthenticated && type.toLowerCase() === 'free') && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                    )}
                </button>

                {hasTrial && !isAuthenticated && (
                    <p className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-2">
                        No credit card required
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default EachPriceCard;
