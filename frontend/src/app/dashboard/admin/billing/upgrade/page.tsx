"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PlanUpgradeDisplay from '@/components/pricing/PlanUpgradeDisplay';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolBilling } from '@/lib/api/hooks/useSchool';
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchPricing } from '@/components/pricing/query';
import { PricingData } from '@/components/Types/Pricing';

export default function UpgradePlanPage() {
    const router = useRouter();
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

    const { subscription } = billingData || {};
    
    // Dynamic pricing retrieval
    const currentPlan = (subscription?.plan || "FREE").toUpperCase();
    const currentCycle = subscription?.billingCycle || "monthly";
    
    const schoolPricing = pricingData?.find((d: PricingData) => d.category === 'schools');
    const activePlanData = schoolPricing?.tabs.find((t: any) => t.type.toLowerCase() === currentPlan.toLowerCase());
    
    const currentPlanPrice = activePlanData 
        ? (currentCycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly) 
        : 0;

    return (
        <div className="min-h-screen pb-20">
            {/* Back Header */}
            <div className="mb-10 flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="rounded-full w-12 h-12 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Upgrade Your Plan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Dashboard / Billing / Upgrade
                    </p>
                </div>
            </div>

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

