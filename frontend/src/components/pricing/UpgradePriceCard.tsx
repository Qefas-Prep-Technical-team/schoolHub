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
    id, name, description, pricing, type, features, isPopular, index,
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
                whileHover={(!isCurrentPlanAndCycle && !isDeactivated) ? { y: -5 } : {}}
                className={`relative flex flex-col bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all duration-300 w-full h-full min-h-[500px] ${
                    isCurrentPlanAndCycle
                        ? 'border-slate-200 dark:border-slate-800 opacity-60 grayscale-[0.5] cursor-not-allowed'
                        : isDeactivated
                            ? 'border-slate-200 dark:border-slate-800 opacity-40 grayscale cursor-not-allowed'
                            : 'border-slate-100 dark:border-slate-800 hover:shadow-xl'
                }`}
            >
                {/* Colored Top Border Strip */}
                <div className={`h-1 w-full ${
                    index === 0 ? 'bg-slate-300 dark:bg-slate-600' :
                    index === 1 ? 'bg-blue-600 dark:bg-blue-500' :
                    'bg-amber-400 dark:bg-amber-500'
                }`} />

                <div className="flex-grow p-8 flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-[15px] font-medium text-slate-800 dark:text-slate-200 capitalize mb-4">
                            {name || type}
                        </h3>
                        
                        {/* Pricing */}
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">₦</span>
                            <span className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 dark:text-white">
                                {isDowngrade ? (amount || 0).toLocaleString() : proRata.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500">
                                /{billingType === 'monthly' ? 'month' : 'year'}
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            {description || 'Perfect for Small Teams, Startups, and Growing Businesses'}
                        </p>

                        <button
                            onClick={handleAction}
                            disabled={isLoading || isCurrentPlanAndCycle || isDeactivated}
                            className={`w-full py-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                                (isCurrentPlanAndCycle || isDeactivated)
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#111827] dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100'
                            }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span>
                                    {isCurrentPlanAndCycle ? 'Active Plan'
                                        : isDeactivated ? 'Unavailable'
                                        : isDowngrade ? 'Schedule Downgrade'
                                        : 'Learn more'}
                                </span>
                            )}
                        </button>
                    </div>
                    {/* Features */}
                    <div className="space-y-4">
                        <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">Features:</p>
                        {features?.map((feature) => (
                            <div key={feature} className="flex items-start gap-3">
                                <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-white dark:text-slate-900" />
                                </div>
                                <span className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default UpgradePriceCard;
