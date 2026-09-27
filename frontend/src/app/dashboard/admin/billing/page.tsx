"use client"
import React from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Calendar,
    ShieldCheck,
    Zap,
    AlertCircle,
    CheckCircle2,
    Plus,
    Landmark,
    TrendingDown,
    X,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolBilling } from '@/lib/api/hooks/useSchool';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGlobalFeatures } from '@/lib/api/hooks/useGlobalFeatures';
import { useFetchPricing } from '@/components/pricing/query';
import { PricingData } from '@/components/Types/Pricing';
import { AtmAccountCard } from '../components/AtmAccountCard';
import { financeService } from '@/lib/api/services/financeService';
import { toast } from 'react-toastify';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';

export default function AdminBillingPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const rawSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
    const isSuperAdmin = (user as any)?.userType === 'SUPER_ADMIN' || (user as any)?.role === 'SUPER_ADMIN';
    // Only pass a real schoolId (not the platform placeholder)
    const schoolId = (rawSchoolId && rawSchoolId !== 'default-tenant-id') ? rawSchoolId : undefined;

    const [currentPage, setCurrentPage] = React.useState(1);
    const [isNavigating, setIsNavigating] = React.useState(false);
    const ITEMS_PER_PAGE = 5;

    const { data: pricingData } = useFetchPricing();
    const { data: billingData, isLoading, isError } = useSchoolBilling(schoolId as string, {
        page: currentPage,
        limit: ITEMS_PER_PAGE
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['school-analytics', schoolId],
        queryFn: () => financeService.getSchoolAnalytics(schoolId!),
        enabled: !!schoolId
    });

    const { data: features, isLoading: isFeaturesLoading } = useGlobalFeatures('admin');

    React.useEffect(() => {
        if (!isFeaturesLoading && features && features.billing === false) {
            router.replace('/dashboard/admin');
        }
    }, [features, isFeaturesLoading, router]);

    const [financeLoading, setFinanceLoading] = React.useState(false);

    const handleSync = async (accountId?: string) => {
        if (!schoolId) return;
        try {
            setFinanceLoading(true);
            const result = await financeService.syncSubaccountStatus(schoolId, accountId);
            toast.success(result.message);
            const updated = await financeService.getSchoolAnalytics(schoolId);
            queryClient.setQueryData(['school-analytics', schoolId], updated);
        } catch (error: any) {
            toast.error(error.message || "Sync failed");
        } finally {
            setFinanceLoading(false);
        }
    };
    if (isLoading || financeLoading || isFeaturesLoading || analyticsLoading) {
        return (
            <div className="space-y-8 pb-20 max-w-[1600px] mx-auto min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 mt-4 md:mt-8">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-[400px] rounded-xl" />
                        <Skeleton className="h-4 w-[350px] rounded-md" />
                    </div>
                    <Skeleton className="h-12 w-40 rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Banner Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Banner Card */}
                        <div className="h-[380px] rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-900 p-8 flex flex-col justify-between shadow-lg">
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-32 rounded-md bg-slate-800" />
                                <Skeleton className="h-12 w-64 rounded-xl bg-slate-800" />
                                <Skeleton className="h-6 w-48 rounded-md bg-slate-800" />
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-800 pt-6 mt-6">
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-32 rounded-md bg-slate-800" />
                                    <Skeleton className="h-6 w-24 rounded-md bg-slate-800" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-32 rounded-md bg-slate-800" />
                                    <Skeleton className="h-6 w-40 rounded-md bg-slate-800" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column */}
                    <div className="space-y-6">
                        {/* Next Payment Card */}
                        <div className="h-[180px] rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
                            <Skeleton className="size-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-8 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-3 w-full rounded-md bg-slate-200 dark:bg-slate-800" />
                            </div>
                        </div>
                        {/* Usage Limits Card */}
                        <div className="h-[180px] rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 flex flex-col justify-between shadow-lg">
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-32 rounded-md bg-slate-800" />
                                <Skeleton className="h-2 w-full rounded-full bg-slate-800" />
                                <Skeleton className="h-2 w-full rounded-full bg-slate-800" />
                                <Skeleton className="h-2 w-full rounded-full bg-slate-800" />
                            </div>
                            <Skeleton className="h-10 w-full rounded-xl bg-slate-800" />
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="pt-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="size-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48 rounded-md" />
                            <Skeleton className="h-4 w-64 rounded-md" />
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError || (!billingData && !isSuperAdmin && !!schoolId)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Failed to load billing data</h3>
                <p className="text-slate-500">Please try again later or contact support.</p>
                <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-6">Retry</Button>
            </div>
        );
    }

    // For SUPER_ADMINs with no school, show a platform-level placeholder
    if (isSuperAdmin && !schoolId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
                <ShieldCheck className="w-16 h-16 text-blue-500" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Platform Administrator</h3>
                <p className="text-slate-500 text-center max-w-md">
                    As a Super Admin, your account operates at the platform level and is not associated with a specific school billing plan.
                    Manage individual school subscriptions through the Schools management section.
                </p>
            </div>
        );
    }

    const { subscription, transactions } = billingData ?? {};

    // Prioritize the plan name from subscription metadata if available (covers trials of higher plans)
    const currentPlan = (subscription?.plan || "FREE").toUpperCase();
    const cycle = subscription?.billingCycle || "monthly";

    // Dynamic pricing retrieval
    const schoolPricing = pricingData?.find((d: PricingData) => d.category === 'schools');
    const activePlanData = schoolPricing?.tabs?.find((t: any) => t.type.toLowerCase() === currentPlan.toLowerCase());
    const dynamicAmount = activePlanData
        ? (cycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly)
        : subscription?.amount || 0;  // Use backend amount as fallback

    const isTrial = subscription?.isTrialActive === true;
    const isBasicTier = currentPlan === 'FREE' || currentPlan === 'BASIC' || currentPlan === 'INSTITUTIONAL BASIC';
    const computedStatus = isBasicTier ? 'INACTIVE' : (subscription?.subscriptionStatus === 'EXPIRED' ? 'EXPIRED' : (isTrial ? "TRIAL" : (subscription?.subscriptionStatus || "INACTIVE")));

    const subscriptionInfo = {
        plan: activePlanData?.name || (isTrial ? `${currentPlan} Plan` : null) || subscription?.plan || "Free Tier",
        status: computedStatus,
        renewalDate: subscription?.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString() : "N/A",
        amount: dynamicAmount,
        billingCycle: cycle,
        features: (subscription?.features && subscription.features.length > 0) ? subscription.features : (activePlanData?.features || [])
    };

    const latestTxn = transactions?.find((t: any) => t.status === 'SUCCESS');
    const storageUsedGB = ((billingData?.usage?.storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(1);

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                        Subscription & Billing
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                        Manage your school's subscription plan and billing details
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        disabled={isNavigating}
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-900 border-2 h-14 px-8 shadow-sm"
                        onClick={() => {
                            setIsNavigating(true);
                            router.push('/dashboard/admin/billing/upgrade');
                        }}
                    >
                        {isNavigating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Change Plan"
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Pending Downgrade Banner */}
            {billingData?.pendingDowngrade && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5"
                >
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-amber-800 dark:text-amber-300 text-sm">
                            Downgrade Scheduled
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 text-xs font-medium mt-1">
                            Your plan will downgrade to{' '}
                            <span className="font-black capitalize">{billingData.pendingDowngrade.plan}</span>{' '}
                            ({billingData.pendingDowngrade.billingCycle}) at the end of your current billing period on{' '}
                            <span className="font-black">{subscriptionInfo.renewalDate}</span>.
                            You keep all current features until then.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                const { apiClient } = await import('@/lib/api/client');
                                await apiClient.delete('/payment/schedule-downgrade');
                                queryClient.invalidateQueries({ queryKey: ['school'] });
                                toast.success('Downgrade cancelled. Your current plan will continue.');
                            } catch {
                                toast.error('Failed to cancel downgrade. Please try again.');
                            }
                        }}
                        className="flex-shrink-0 w-8 h-8 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center text-amber-600 transition-colors"
                        title="Cancel scheduled downgrade"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Current subscription plan (Blue Gradient) */}
                <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-[#6C5CE7] to-[#74B9FF] text-white p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#55EFC4]/40 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#FF7675]/40 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium opacity-90 mb-1">Current subscription plan</p>
                        <h2 className="text-5xl font-bold uppercase mt-2">{subscriptionInfo.plan}</h2>
                    </div>
                    <div className="relative z-10 mt-8">
                        <p className="text-sm font-medium mb-3 opacity-90">Need extra features?</p>
                        <Button onClick={() => router.push('/dashboard/admin/billing/pricing')} className="bg-white text-[#6C5CE7] hover:bg-slate-50 font-bold rounded-lg px-6 h-10">
                            Upgrade
                        </Button>
                    </div>
                </Card>

                {/* 2. Your Purpose plan */}
                <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between min-h-[220px] bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wide">Your {subscriptionInfo.plan} plan</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{subscriptionInfo.plan}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {subscriptionInfo.amount === 0 ? 'Free' : `₦${subscriptionInfo.amount.toLocaleString()}`}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mt-1">per {subscriptionInfo.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>
                    </div>
                    <div className="flex gap-4 my-4">
                        {subscriptionInfo.features.slice(0, 2).map((feature: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-[#55EFC4]" /> 
                                <span className="truncate max-w-[120px]">{feature}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-4 py-2.5 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm flex-1">
                            <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span>1 School</span>
                        </div>
                    </div>
                </Card>

                {/* 3. Payment methods (Spans 2 rows) */}
                <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 lg:row-span-2 flex flex-col bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment method</h3>
                    </div>
                    <div className="space-y-4 flex-1">
                        {latestTxn ? (
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex gap-4 items-center">
                                <div className="w-14 h-9 bg-slate-900 dark:bg-black rounded-md flex items-center justify-center relative shadow-sm overflow-hidden">
                                    {latestTxn.paymentMethod?.toLowerCase().includes('transfer') ? (
                                        <div className="w-full h-full bg-[#192A56] flex items-center justify-center text-[10px] font-bold text-white tracking-widest">TRF</div>
                                    ) : (
                                        <>
                                            <div className="w-4 h-4 bg-[#FF7675] rounded-full absolute left-2.5 opacity-90 mix-blend-screen" />
                                            <div className="w-4 h-4 bg-[#FDCB6E] rounded-full absolute left-5 opacity-90 mix-blend-screen" />
                                        </>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                        {latestTxn.paymentMethod?.replace('_', ' ') || 'Card'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last used: {new Date(latestTxn.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                <p className="text-xs font-semibold text-slate-400">No payment method found</p>
                            </div>
                        )}
                    </div>
                    <Button 
                        onClick={() => router.push('/dashboard/admin/billing/upgrade')}
                        className="w-full bg-[#6C5CE7] hover:bg-[#5A4BCC] text-white rounded-lg mt-6 py-6 font-semibold"
                    >
                        Update payment method
                    </Button>
                </Card>

                {/* 4. API Used (Usage / Analytics summary) */}
                <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-center bg-white dark:bg-slate-900 min-h-[120px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-red-50 dark:bg-[#FF7675]/10 rounded-lg flex items-center justify-center text-[#FF7675]">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Storage Used</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{storageUsedGB}</h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">of {subscriptionInfo.plan.toLowerCase() === 'pro' ? '50.0' : '10.0'} GB</span>
                    </div>
                </Card>

                {/* 5. Plan Renewal */}
                <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-center bg-white dark:bg-slate-900 min-h-[120px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-50 dark:bg-[#55EFC4]/10 rounded-lg flex items-center justify-center text-[#55EFC4]">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Your plan will renew</p>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{isBasicTier ? 'N/A' : subscriptionInfo.renewalDate}</h3>
                </Card>
            </div>

            {/* Usage Limits Section */}
            <div className="mt-12">
                <UsageLimitsCard role="ADMIN" />
            </div>

            {analytics?.accounts && analytics.accounts.length > 0 && (
                <div className="space-y-6 mt-12 bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <Landmark size={28} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Bank Accounts</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active accounts for receiving payments</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5 gap-2"
                            onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                        >
                            <Plus className="h-3 w-3" />
                            Add Bank Account
                        </Button>
                    </div>
                    <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 no-scrollbar snap-x mt-6">
                        {analytics.accounts.map((acc: any) => (
                            <div key={acc.id} className="snap-center flex-shrink-0 w-full md:w-[380px]">
                                <AtmAccountCard
                                    account={acc}
                                    onRefresh={(id) => handleSync(id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-6 mt-12">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <CreditCard size={24} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                            Transaction History
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">A complete record of all your past payments and receipts</p>
                    </div>
                </div>
                <TransactionHistory
                    items={transactions ?? []}
                    totalItems={billingData?.totalTransactions ?? 0}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-[2.5rem] p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm flex-shrink-0">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">Need help with billing?</h4>
                        <p className="text-slate-500 font-medium">Our support team is available 24/7 for any billing inquiries.</p>
                    </div>
                </div>
                <Button onClick={() => router.push('/dashboard/admin/support')} variant="outline" className="rounded-2xl font-bold border-2 px-8 h-12 hover:bg-slate-900 hover:text-white transition-all">
                    Contact Support
                </Button>
            </div>
        </div>
    );
}

