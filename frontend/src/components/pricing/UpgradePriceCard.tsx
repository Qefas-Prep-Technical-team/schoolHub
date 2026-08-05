"use client";
import React, { FC, useState } from 'react';
import { PricingTab as PricingTabType } from '../Types/Pricing';
import { useBillingStore } from '@/utils/PricingPage';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Zap, Shield, Rocket, Loader2, ArrowRight,
    Sparkles, TrendingDown, Info, X, XCircle
} from 'lucide-react';
import { useCheckoutStore } from '@/utils/CheckoutStore';
import { calculateProRatedAmount } from '@/utils/pricingUtils';

interface UpgradePriceCardProps extends PricingTabType {
    category?: string;
    index?: number;
    currentPlan?: string;
    currentPlanId?: string;
    currentBillingCycle?: string;
    currentPlanPrice?: number;
    lastPaymentDate?: string | Date | null;
}

// ─── Downgrade Confirmation Modal ──────────────────────────────────────────────
interface DowngradeModalProps {
    isOpen: boolean;
    planName: string;
    billingCycle: string;
    newPrice: number;
    lostFeatures: string[];
    onConfirm: () => void;
    onCancel: () => void;
}

function DowngradeModal({ isOpen, planName, billingCycle, newPrice, lostFeatures, onConfirm, onCancel }: DowngradeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Amber accent strip */}
                        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

                        <div className="p-8">
                            {/* Close button */}
                            <button
                                onClick={onCancel}
                                className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Icon */}
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingDown className="w-8 h-8 text-amber-600" />
                            </div>

                            {/* Heading */}
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                                Downgrade to {planName}?
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
                                You're switching to a lower-tier plan. Here's exactly what that means:
                            </p>

                            {/* Info blocks */}
                            <div className="space-y-3 mb-6">
                                {/* Good news */}
                                <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-4">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-green-800 dark:text-green-300">Your current plan stays active</p>
                                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mt-0.5">
                                            All features remain available until your current billing period ends.
                                        </p>
                                    </div>
                                </div>

                                {/* No charge */}
                                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4">
                                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-blue-800 dark:text-blue-300">No charge today</p>
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mt-0.5">
                                            The new price of{' '}
                                            <span className="font-black">
                                                ₦{newPrice.toLocaleString()}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                            </span>{' '}
                                            only applies at your next renewal.
                                        </p>
                                    </div>
                                </div>

                                {/* Lost features */}
                                {lostFeatures.length > 0 && (
                                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-red-800 dark:text-red-300">
                                                Features you'll lose at renewal
                                            </p>
                                            <ul className="mt-1.5 space-y-0.5">
                                                {lostFeatures.map(f => (
                                                    <li key={f} className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTAs */}
                            <div className="space-y-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <TrendingDown className="w-4 h-4" />
                                    Yes, Schedule Downgrade to {planName}
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="w-full py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
                                >
                                    Cancel — Keep Current Plan
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Main Card ─────────────────────────────────────────────────────────────────
const UpgradePriceCard: FC<UpgradePriceCardProps> = ({
    id, name, description, pricing, type, features, isPopular,
    currentPlan, currentPlanId, currentBillingCycle, currentPlanPrice, lastPaymentDate
}) => {
    const { billingType } = useBillingStore();
    const { isAuthenticated, user } = useAuthStore();
    const { setCheckoutDetails } = useCheckoutStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);

    const amount = billingType === 'monthly' ? pricing?.monthly : pricing?.yearly;

    const activePlanId = currentPlanId || user?.subscriptionPlanId;
    const activePlanName = currentPlan || user?.plan || 'free';
    const activeBillingCycle = currentBillingCycle || user?.billingCycle || 'monthly';

    const isPlanMatch = (id && activePlanId && id === activePlanId) ||
        (type?.toLowerCase() === activePlanName.toLowerCase());

    const isCurrentPlanAndCycle = isAuthenticated && isPlanMatch &&
        (activeBillingCycle.toLowerCase() === billingType.toLowerCase());

    const isFreePlan = type?.toLowerCase() === 'free';
    const isDeactivated = isFreePlan;

    // Must be before isDowngrade
    const proRata = amount && currentPlanPrice
        ? calculateProRatedAmount(currentPlanPrice, amount, lastPaymentDate || null)
        : { amount: amount || 0, isUpgrade: false };

    const isDowngrade = !isCurrentPlanAndCycle && !isDeactivated
        && amount !== undefined && currentPlanPrice !== undefined
        && amount < currentPlanPrice;

    const proceedToCheckout = () => {
        setCheckoutDetails({
            plan: type,
            billing: billingType,
            role: 'ADMIN',
            discountedAmount: isDowngrade ? 0 : proRata.amount,
            isUpgrade: isDowngrade ? false : proRata.isUpgrade,
        });
        setIsLoading(true);
        router.push('/checkout');
    };

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCurrentPlanAndCycle || isDeactivated) return;
        if (isDowngrade) {
            setShowDowngradeModal(true);
            return;
        }
        proceedToCheckout();
    };

    const getIcon = () => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('starter')) return <Rocket className="w-6 h-6 text-blue-500" />;
        if (lowerType.includes('growth')) return <Zap className="w-6 h-6 text-amber-500" />;
        return <Shield className="w-6 h-6 text-indigo-500" />;
    };

    return (
        <>
            <DowngradeModal
                isOpen={showDowngradeModal}
                planName={name || type}
                billingCycle={billingType}
                newPrice={amount || 0}
                lostFeatures={[]}
                onConfirm={() => {
                    setShowDowngradeModal(false);
                    proceedToCheckout();
                }}
                onCancel={() => setShowDowngradeModal(false)}
            />

            <motion.div
                whileHover={(!isCurrentPlanAndCycle && !isDeactivated) ? { y: -12, scale: 1.02 } : {}}
                onClick={handleAction}
                className={`group relative flex flex-col rounded-[3rem] border-2 transition-all duration-500 w-full h-full min-h-[650px] ${
                    isCurrentPlanAndCycle
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-70 grayscale-[0.5] cursor-not-allowed pointer-events-none'
                        : isDeactivated
                            ? 'border-slate-100 dark:border-slate-800/30 bg-slate-100/20 dark:bg-slate-900/10 opacity-40 grayscale cursor-not-allowed pointer-events-none'
                            : isDowngrade
                                ? 'border-amber-200 dark:border-amber-800/50 bg-white dark:bg-slate-900 shadow-xl shadow-amber-100/50 dark:shadow-amber-900/20 cursor-pointer'
                                : isPopular
                                    ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-2xl cursor-pointer'
                                    : 'border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl cursor-pointer'
                }`}
            >
                {/* Active badge */}
                {isCurrentPlanAndCycle && (
                    <div className="absolute top-8 right-8 z-30">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                            Active
                        </div>
                    </div>
                )}

                {/* Downgrade badge */}
                {isDowngrade && (
                    <div className="absolute top-8 left-8 z-30">
                        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                            <TrendingDown className="w-3 h-3" />
                            Downgrade
                        </div>
                    </div>
                )}

                <div className="flex-grow p-10 relative z-10 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col gap-6 mb-10">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${
                            isDowngrade
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : isPopular
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                            {isDowngrade ? <TrendingDown className="w-6 h-6 text-amber-600" /> : getIcon()}
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

                    {/* Pricing */}
                    <div className="mb-10 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-black text-slate-400">₦</span>
                            <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                                {isDowngrade ? (amount || 0).toLocaleString() : proRata.amount.toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-slate-500">
                                /{billingType === 'monthly' ? 'mo' : 'yr'}
                            </span>
                        </div>
                        {isDowngrade ? (
                            <div className="flex items-start gap-2 mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
                                <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                                    Takes effect at period end · No charge now
                                </p>
                            </div>
                        ) : proRata.isUpgrade ? (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-widest animate-pulse">Pro-rated</span>
                                <span className="text-[10px] font-bold text-slate-400">Credit applied</span>
                            </div>
                        ) : isCurrentPlanAndCycle ? (
                            <div className="text-[10px] font-bold text-blue-500 mt-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                <span>Your current active price</span>
                            </div>
                        ) : (
                            <div className="text-[10px] font-bold text-slate-400 mt-2">Full price · Billing resets</div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-10">
                        {features?.slice(0, 5).map((feature) => (
                            <div key={feature} className="flex items-start gap-3">
                                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                    isDowngrade ? 'text-amber-400' : isPopular ? 'text-blue-500' : 'text-slate-400'
                                }`} />
                                <span className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-snug">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800/50">
                        <button
                            onClick={handleAction}
                            disabled={isLoading || isCurrentPlanAndCycle || isDeactivated}
                            className={`w-full py-5 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-2 ${
                                (isCurrentPlanAndCycle || isDeactivated)
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : isDowngrade
                                        ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30 hover:bg-amber-600 ring-2 ring-amber-300 dark:ring-amber-700 ring-offset-2'
                                        : isPopular
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700'
                                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'
                            }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>
                                        {isCurrentPlanAndCycle ? 'Active Plan'
                                            : isDeactivated ? 'Plan Unavailable'
                                            : isDowngrade ? 'Schedule Downgrade'
                                            : 'Select This Plan'}
                                    </span>
                                    {!isCurrentPlanAndCycle && !isDeactivated && (
                                        isDowngrade
                                            ? <TrendingDown className="w-5 h-5" />
                                            : <ArrowRight className="w-5 h-5" />
                                    )}
                                </>
                            )}
                        </button>
                        {isDowngrade && (
                            <p className="text-center text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-3">
                                ✓ No charge today · Click to review details
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default UpgradePriceCard;
