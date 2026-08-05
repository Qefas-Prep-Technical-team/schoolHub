"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PlanUpgradeDisplay from '@/components/pricing/PlanUpgradeDisplay';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolBilling } from '@/lib/api/hooks/useSchool';
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchPricing } from '@/components/pricing/query';
import { PricingData } from '@/components/Types/Pricing';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

export default function UpgradePlanPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
    
    const { data: pricingData } = useFetchPricing();
    const { data: billingData, isLoading } = useSchoolBilling(schoolId as string);

    if (isLoading) {
        return (
            <div className="p-8 md:p-12 space-y-8">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-96 w-full rounded-[3rem]" />
            </div>
        );
    }

    const { subscription, pendingDowngrade } = (billingData as any) || {};
    
    // Dynamic pricing retrieval
    const currentPlan = (subscription?.plan || "FREE").toUpperCase();
    const currentCycle = subscription?.billingCycle || "monthly";
    
    const schoolPricing = pricingData?.find((d: PricingData) => d.category === 'schools');
    const activePlanData = schoolPricing?.tabs.find((t: any) => t.type.toLowerCase() === currentPlan.toLowerCase());
    
    const currentPlanPrice = activePlanData 
        ? (currentCycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly) 
        : 0;

    const handleCancelDowngrade = async () => {
        try {
            await apiClient.delete('/payment/schedule-downgrade');
            queryClient.invalidateQueries({ queryKey: ['school'] });
            toast.success('Downgrade cancelled. Your current plan will continue.');
        } catch {
            toast.error('Failed to cancel downgrade. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Back Header */}
            <div className="mb-6 flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="rounded-full w-12 h-12 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Change Your Plan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Dashboard / Billing / Change Plan
                    </p>
                </div>
            </div>

            {/* Pending Downgrade Banner */}
            {pendingDowngrade && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-6"
                >
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-amber-800 dark:text-amber-300 text-sm">
                            Downgrade Already Scheduled
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 text-xs font-medium mt-1">
                            Your plan is set to downgrade to{' '}
                            <span className="font-black capitalize">{pendingDowngrade.plan}</span>{' '}
                            ({pendingDowngrade.billingCycle}) at the end of your current billing period.
                            Selecting a new plan below will replace this scheduled change.
                        </p>
                    </div>
                    <button
                        onClick={handleCancelDowngrade}
                        className="flex-shrink-0 w-8 h-8 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center text-amber-600 transition-colors"
                        title="Cancel scheduled downgrade"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900/50 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 md:p-16 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
            >
                <PlanUpgradeDisplay 
                    currentPlan={subscription?.plan}
                    currentPlanId={subscription?.subscriptionPlanId}
                    currentBillingCycle={currentCycle}
                    isUpgradeFlow={true}
                    currentPlanPrice={currentPlanPrice}
                    lastPaymentDate={subscription?.lastPaymentDate}
                />
            </motion.div>
        </div>
    );
}

