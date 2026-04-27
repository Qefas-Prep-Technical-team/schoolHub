"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { 
    CreditCard, 
    Calendar, 
    ShieldCheck, 
    Zap, 
    Clock, 
    AlertCircle,
    CheckCircle2,
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
import { toast } from 'react-toastify';

export default function StudentBillingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 5;
    
    const { data: pricingData } = useFetchPricing();
    const { data: billingData, isLoading, isError } = useUserBilling(user?.id as string, { 
        page: currentPage, 
        limit: ITEMS_PER_PAGE 
    });

    if (isLoading) {
        return (
            <div className="space-y-8 pb-12 p-6">
                <Skeleton className="h-12 w-1/3 rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-64 rounded-[2.5rem]" />
                    <Skeleton className="h-64 rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    if (isError || !billingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Failed to load billing data</h3>
                <p className="text-slate-500">Please try again later or contact support.</p>
                <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-6">Retry</Button>
            </div>
        );
    }

    const { subscription, usage, transactions } = billingData.data || {};
    const plan = subscription?.plan?.toUpperCase() || "FREE";
    
    // Plan limits mapping for students
    const planLimits = {
        PRO: { storage: 25 },
        ESSENTIAL: { storage: 10 },
        FREE: { storage: 1 }
    };

    const currentLimits = planLimits[plan as keyof typeof planLimits] || planLimits.FREE;
    const storageLimit = currentLimits.storage;

    const currentPlan = (subscription?.plan || "FREE").toUpperCase();
    const cycle = subscription?.billingCycle || "monthly";

    // Dynamic pricing retrieval
    const studentPricing = pricingData?.find((d: PricingData) => (d.category as string) === 'individuals');
    const activePlanData = studentPricing?.tabs.find((t: any) => t.type.toLowerCase() === currentPlan.toLowerCase());
    const dynamicAmount = activePlanData 
        ? (cycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly) 
        : 0;

    const subscriptionInfo = {
        plan: subscription?.plan || "Free Plan",
        status: subscription?.subscriptionStatus || "INACTIVE",
        renewalDate: subscription?.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString() : "N/A",
        amount: dynamicAmount,
        billingCycle: cycle,
        features: activePlanData?.features || [
                "Individual Learning Dashboard",
                "Course Materials Access",
                "Basic Study Tools",
                "Result History"
            ]
    };

    const storageGB = ((usage?.storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(1);
    const storagePercentage = Math.min((Number(storageGB) / storageLimit) * 100, 100);

    return (
        <div className="space-y-8 pb-12 p-6 lg:p-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        My Subscription
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Manage your individual learning plan and billing.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl font-bold border-2 h-12 px-6"
                        onClick={() => router.push('/pricing?role=student')}
                    >
                        Explore Plans
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50">
                    <CardHeader className="bg-slate-900 dark:bg-slate-800 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-2">
                                <Badge className="bg-pink-500/20 text-pink-400 border-none px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                                    Current Plan
                                </Badge>
                                <CardTitle className="text-4xl font-black capitalize">{subscriptionInfo.plan}</CardTitle>
                                <CardDescription className="text-slate-400 font-medium text-lg">
                                    {subscriptionInfo.billingCycle === 'monthly' ? 'Billed Monthly' : 'Billed Yearly'}
                                </CardDescription>
                            </div>
                            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Subscription Status</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${subscriptionInfo.status === 'ACTIVE' || subscriptionInfo.status === 'TRIAL' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                                            {subscriptionInfo.status === 'TRIAL' ? 'Free Trial' : subscriptionInfo.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Next Billing Date</p>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <span className="text-xl font-bold text-slate-900 dark:text-white">{subscriptionInfo.renewalDate}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Plan Highlights</p>
                                <ul className="space-y-3">
                                    {subscriptionInfo.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8">
                        <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Pricing</h4>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black tracking-tighter">₦{subscriptionInfo.amount.toLocaleString()}</span>
                            <span className="text-sm font-bold opacity-70">/ {subscriptionInfo.billingCycle}</span>
                        </div>
                        <p className="text-sm opacity-80 font-medium leading-relaxed">
                            Upgrade to unlock premium AI learning assistants and expanded storage for your academic materials.
                        </p>
                    </Card>

                    <Card className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl p-8 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white leading-tight">Resources</h4>
                                <p className="text-xs text-slate-500 font-medium">Capacity tracking</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-500">Cloud Storage</span>
                                    <span className="text-slate-900 dark:text-white">{storageGB} GB / {storageLimit} GB</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${storagePercentage}%` }} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="space-y-6 mt-12">
                <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-pink-500" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Payment History
                    </h2>
                </div>
                <TransactionHistory 
                    items={transactions} 
                    totalItems={billingData.totalTransactions}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

