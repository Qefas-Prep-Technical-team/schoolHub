"use client";
import React from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { useUserBilling, useSchoolBilling } from '@/lib/api/hooks/useSchool';

export const TrialBanner = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.userType === 'ADMIN';
    const isParent = user?.userType === 'PARENT';
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
    
    // For admins, use subscription usage hook AND school billing for dates
    const { data: usageData } = useSubscriptionUsage(isAdmin);
    const { data: adminBillingData } = useSchoolBilling(isAdmin ? schoolId : '', { limit: 1 });
    
    // For parents, use user billing hook
    const { data: parentBillingData } = useUserBilling(isParent ? user?.id : '', { limit: 1 });
    
    // Determine trial status
    const isTrialByPlan = user?.plan?.toUpperCase()?.includes('TRIAL');
    const isTrialByUsage = isAdmin && usageData?.isTrial;
    const isTrialByBilling = (isParent && parentBillingData?.data?.subscription?.isTrialActive) || 
                             (isAdmin && adminBillingData?.subscription?.isTrialActive);
    
    const isTrial = !!isTrialByPlan || !!isTrialByUsage || !!isTrialByBilling;

    // Determine expiration date from all possible sources
    const trialEndsAt = user?.trialEndsAt 
        ? new Date(user.trialEndsAt) 
        : (isParent && parentBillingData?.data?.subscription?.subscriptionEnd)
            ? new Date(parentBillingData.data.subscription.subscriptionEnd)
            : (isAdmin && adminBillingData?.subscription?.subscriptionEnd)
                ? new Date(adminBillingData.subscription.subscriptionEnd)
                : null;

    const now = new Date();
    const isExpired = !!trialEndsAt && trialEndsAt < now;

    // If not on trial, or trial expired (and no usage data saying otherwise), don't show
    if (!isTrial || (isExpired && !isTrialByUsage && !isTrialByBilling)) return null;
    if (user?.plan === 'FREE' && !isTrialByUsage && !isTrialByBilling) return null;

    // Calculate days remaining
    let diffDays: number | null = null;
    if (trialEndsAt && !isExpired) {
        const diffTime = Math.abs(trialEndsAt.getTime() - now.getTime());
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (isTrial && !trialEndsAt) {
        // Fallback if trial is active but date is somehow missing - default to 14 if it's a fresh account or show generic
        diffDays = 14; 
    }

    const upgradePath = isParent 
        ? '/dashboard/parent/billing' 
        : `/dashboard/${user?.userType?.toLowerCase()}/billing`;

    const displayPlan = (isParent && parentBillingData?.data?.subscription?.plan) 
        ? parentBillingData.data.subscription.plan.toUpperCase() 
        : (isAdmin && adminBillingData?.subscription?.plan)
            ? adminBillingData.subscription.plan.toUpperCase()
            : (user?.plan || 'TRIAL');

    return (
        <div className="mb-6 group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/80 to-primary p-0.5 shadow-lg shadow-primary/20">
                <div className="relative bg-white dark:bg-slate-900 rounded-[14px] p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all group-hover:bg-transparent duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-white group-hover:text-primary transition-colors">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-lexend font-black text-slate-900 dark:text-white group-hover:text-white transition-colors">
                                {displayPlan} <span className="text-primary group-hover:text-white/80 uppercase">Trial Active</span>
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors">
                                {diffDays !== null ? (
                                    <>You have <span className="font-bold text-slate-900 dark:text-white group-hover:text-white">{diffDays} days</span> remaining to explore full premium potential.</>
                                ) : (
                                    <>Explore the full potential of Qefas Hub during your trial period.</>
                                )}
                            </p>
                        </div>
                    </div>
                    
                    <Link 
                        href={upgradePath}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-105 transition-all shadow-xl group-hover:bg-white group-hover:text-primary"
                    >
                        Upgrade Now
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};
