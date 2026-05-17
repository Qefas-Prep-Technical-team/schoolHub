'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Calendar,
    ShieldCheck,
    Users,
    Clock,
    AlertCircle,
    CheckCircle2,
    Baby,
    ChevronRight,
    TrendingUp,
    Zap,
    Download,
    History,
    Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useUserBilling } from '@/lib/api/hooks/useSchool';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { useFetchPricing } from '@/components/pricing/query';
import { PricingData } from '@/components/Types/Pricing';
import { cn } from '@/lib/utils';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';
import { useGlobalFeatures } from '@/lib/api/hooks/useGlobalFeatures';

export default function ParentBillingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 5;

    const { data: pricingData } = useFetchPricing();
    const { data: features } = useGlobalFeatures('parent');
    const { data: billingData, isLoading, isError } = useUserBilling(user?.id as string, {
        page: currentPage,
        limit: ITEMS_PER_PAGE
    });

    React.useEffect(() => {
        if (features && features.billing === false) {
            router.push('/dashboard/parent');
        }
    }, [features, router]);

    if (isLoading) {
        return (
            <div className="space-y-10 pb-12 p-4 md:p-0">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-12 w-1/2 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[450px] rounded-[3rem]" />
                    <div className="space-y-6">
                        <Skeleton className="h-48 rounded-[2.5rem]" />
                        <Skeleton className="h-48 rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !billingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 p-4">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Frequency Disruption</h3>
                    <p className="text-slate-500 max-w-xs mx-auto font-medium">We encountered a signal error while retrieving your financial records. Please re-authenticate or retry.</p>
                </div>
                <Button onClick={() => window.location.reload()} className="rounded-[1.5rem] h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95">
                    Retry Protocol
                </Button>
            </div>
        );
    }

    const { subscription, usage, transactions } = billingData.data || {};
    const plan = subscription?.plan?.toUpperCase() || "FREE";

    // Plan limits mapping for parents
    const planLimits = {
        PRO: { students: 100 }, // Unlimited
        ESSENTIAL: { students: 3 },
        FREE: { students: 1 }
    };

    const currentLimits = planLimits[plan as keyof typeof planLimits] || planLimits.FREE;
    const cycle = subscription?.billingCycle || "monthly";

    // Dynamic pricing retrieval
    const parentPricing = pricingData?.find((d: PricingData) => (d.category as string) === 'parents');
    const activePlanData = parentPricing?.tabs.find((t: any) =>
        t.type.toLowerCase() === plan.toLowerCase() ||
        t.name.toLowerCase() === plan.toLowerCase()
    );
    const dynamicAmount = activePlanData
        ? (cycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly)
        : subscription?.amount || 0;  // Use backend amount as fallback

    const isTrial = subscription?.isTrialActive === true;
    const subscriptionInfo = {
        plan: subscription?.plan || "Parent Free",
        status: isTrial ? "TRIAL" : (subscription?.subscriptionStatus || "INACTIVE"),
        renewalDate: subscription?.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
        amount: dynamicAmount,
        billingCycle: cycle,
        features: activePlanData?.features || [
            "Link 1 student account",
            "Basic result view",
            "Attendance overview",
            "Profile management"
        ]
    };

    const studentPercentage = Math.min(((usage?.students || 0) / currentLimits.students) * 100, 100);

    return (
        <div className="space-y-12 pb-12 p-4 md:p-0 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        <span>Financial Console</span>
                        <ChevronRight size={10} className="text-orange-500" />
                        <span className="text-orange-600">Subscriptions</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/30">
                            <Zap size={24} className="text-white fill-current" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                            Family Billing
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight max-w-xl leading-relaxed">
                        Control your family service access, manage linked student capacity, and review financial transaction history.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        className="h-14 px-10 rounded-[1.8rem] bg-orange-600 hover:bg-orange-700 text-white shadow-2xl shadow-orange-600/30 transition-all font-black text-xs uppercase tracking-widest active:scale-95 group"
                        onClick={() => router.push('/pricing?role=parent')}
                    >
                        <TrendingUp className="mr-3 group-hover:scale-125 transition-transform" size={18} />
                        Upgrade Plan
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-1">
                {/* Main Subscription Card */}
                <Card className="lg:col-span-2 rounded-[3.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <CardHeader className="bg-slate-900 dark:bg-orange-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-24 -translate-y-24 blur-3xl" />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-3">
                                <Badge className="bg-white/20 text-white border-none px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[9px] backdrop-blur-md">
                                    Active Authority
                                </Badge>
                                <div className="space-y-1">
                                    <h2 className="text-5xl font-black capitalize tracking-tighter">{subscriptionInfo.plan} Plan</h2>
                                    <p className="text-white/70 font-bold text-lg tracking-tight leading-tight">
                                        Advanced Student Performance Monitoring
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-6 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                <Shield size={40} className="text-white" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Status</p>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full shadow-lg",
                                            (subscriptionInfo.status === 'ACTIVE' || subscriptionInfo.status === 'TRIAL') ? "bg-green-500 shadow-green-500/50 animate-pulse" : "bg-red-500 shadow-red-500/50"
                                        )} />
                                        <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {subscriptionInfo.status === 'TRIAL' ? 'Experimental Trial' : subscriptionInfo.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Next Dispatch Cycle</p>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <Calendar className="w-6 h-6 text-orange-600" />
                                        <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{subscriptionInfo.renewalDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Protocols</p>
                                <ul className="space-y-4">
                                    {subscriptionInfo.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold text-sm tracking-tight group/item">
                                            <div className="w-6 h-6 rounded-full bg-orange-600/10 flex items-center justify-center group-hover/item:bg-orange-600 transition-colors">
                                                <CheckCircle2 className="w-4 h-4 text-orange-600 group-hover/item:text-white" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    {/* Amount Card */}
                    <Card className="rounded-[3rem] border-none shadow-2xl shadow-orange-600/10 overflow-hidden bg-slate-900 dark:bg-orange-600 text-white p-10 relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 relative z-10">
                            {isTrial ? "Initial Credit Load" : "Protocol Rate"}
                        </h4>
                        <div className="flex items-baseline gap-2 mb-6 relative z-10">
                            <span className="text-5xl font-black tracking-tighter">₦{subscriptionInfo.amount.toLocaleString()}</span>
                            <span className="text-sm font-black uppercase opacity-60">/ {subscriptionInfo.billingCycle}</span>
                        </div>
                        <p className="text-xs opacity-70 font-bold leading-relaxed relative z-10 uppercase tracking-widest italic">
                            Premium plans enable multi-node student linkage and deep academic analytics.
                        </p>
                    </Card>

                    <UsageLimitsCard
                        role="PARENT"
                        title="Family Capacity"
                        primaryColor="#ea580c"
                        upgradeLink="/pricing?role=parent"
                        upgradeLabel="Expand Family Capacity"
                        description="Synchronizing family network metrics with the core protocol."
                    />
                </div>
            </div>

            {/* Billing History Section */}
            <div className="space-y-8 mt-12 px-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-900 dark:bg-white rounded-xl">
                            <History className="w-5 h-5 text-white dark:text-slate-900" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            Dispatch History
                        </h2>
                    </div>
                    <Button variant="ghost" className="hidden md:flex gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600">
                        <Download size={14} /> Download PDF Logs
                    </Button>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-xl">
                    <TransactionHistory
                        items={transactions}
                        totalItems={billingData.totalTransactions}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
