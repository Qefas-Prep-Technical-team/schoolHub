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
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolBilling } from '@/lib/api/hooks/useSchool';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { useFetchPricing } from '@/components/pricing/query';
import { PricingData } from '@/components/Types/Pricing';
import { AtmAccountCard } from '../components/AtmAccountCard';
import { financeService } from '@/lib/api/services/financeService';
import { toast } from 'react-toastify';
import UsageLimitsCard from '../components/dashboard/UsageLimitsCard';

export default function AdminBillingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
    
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 5;
    
    const { data: pricingData } = useFetchPricing();
    const { data: billingData, isLoading, isError } = useSchoolBilling(schoolId as string, { 
        page: currentPage, 
        limit: ITEMS_PER_PAGE 
    });

    const [analytics, setAnalytics] = React.useState<any>(null);
    const [financeLoading, setFinanceLoading] = React.useState(false);

    React.useEffect(() => {
        if (schoolId) {
            financeService.getSchoolAnalytics(schoolId)
                .then(setAnalytics)
                .catch(console.error);
        }
    }, [schoolId]);

    const handleSync = async (accountId?: string) => {
        if (!schoolId) return;
        try {
            setFinanceLoading(true);
            const result = await financeService.syncSubaccountStatus(schoolId, accountId);
            toast.success(result.message);
            const updated = await financeService.getSchoolAnalytics(schoolId);
            setAnalytics(updated);
        } catch (error: any) {
            toast.error(error.message || "Sync failed");
        } finally {
            setFinanceLoading(false);
        }
    };
    if (isLoading || financeLoading) {
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

    const { subscription, transactions } = billingData || {};

    // Prioritize the plan name from subscription metadata if available (covers trials of higher plans)
    const currentPlan = (subscription?.plan || "FREE").toUpperCase();
    const cycle = subscription?.billingCycle || "monthly";

    // Dynamic pricing retrieval
    const schoolPricing = pricingData?.find((d: PricingData) => d.category === 'schools');
    const activePlanData = schoolPricing?.tabs?.find((t: any) => t.type.toLowerCase() === currentPlan.toLowerCase());
    const dynamicAmount = activePlanData 
        ? (cycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly) 
        : 0;

    const isTrial = subscription?.isTrialActive === true;

    const subscriptionInfo = {
        plan: activePlanData?.name || (isTrial ? `${currentPlan} Plan` : null) || subscription?.plan || "Free Tier",
        status: isTrial ? "TRIAL" : (subscription?.subscriptionStatus || "INACTIVE"),
        renewalDate: subscription?.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString() : "N/A",
        amount: dynamicAmount,
        billingCycle: cycle,
        features: (subscription?.features && subscription.features.length > 0) ? subscription.features : (activePlanData?.features || [])
    };

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Billing & Subscription
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Manage your school's plan and billing information.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl font-bold border-2 h-12 px-6"
                        onClick={() => router.push('/dashboard/admin/billing/upgrade')}
                    >
                        Change Plan
                    </Button>
                    <Button className="rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 h-12 px-6 shadow-lg shadow-blue-600/20">
                        Manage Payment Methods
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50">
                    <CardHeader className="bg-slate-900 dark:bg-slate-800 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-2">
                                <Badge className="bg-blue-500/20 text-blue-400 border-none px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                                    Current Plan
                                </Badge>
                                <CardTitle className="text-4xl font-black capitalize flex items-center gap-3">
                                    {subscriptionInfo.plan}
                                    <span className="text-xl opacity-60 font-medium">₦{subscriptionInfo.amount.toLocaleString()}</span>
                                </CardTitle>
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
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${subscriptionInfo.status === 'ACTIVE' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        <span className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                                            {subscriptionInfo.status === 'TRIAL' ? 'Free Trial' : 'Active'}
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
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8">
                        <div className="mb-6 flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                            <Button size="sm" className="bg-white/20 hover:bg-white/30 border-none rounded-xl text-xs font-black uppercase tracking-tight">
                                Details
                            </Button>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Next Payment</h4>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black tracking-tighter">₦{subscriptionInfo.amount.toLocaleString()}</span>
                            <span className="text-sm font-bold opacity-70">/ {subscriptionInfo.billingCycle}</span>
                        </div>
                        <p className="text-sm opacity-80 font-medium leading-relaxed">
                            {subscriptionInfo.status === 'ACTIVE' 
                                ? "Your subscription will automatically renew. Make sure your payment method is up to date."
                                : "Subscribe to a plan to continue enjoying Qefas Hub features after your trial."}
                        </p>
                    </Card>

                    <UsageLimitsCard />
                </div>
            </div>

            {analytics?.accounts && analytics.accounts.length > 0 && (
                <div className="space-y-6 mt-12 bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <Plus className="w-6 h-6 text-blue-500" />
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settlement Vault</h2>
                                <p className="text-sm text-slate-500 font-medium tracking-tight">Active conduits for automatic fee disbursements.</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 gap-2"
                            onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                        >
                            <Plus className="h-3 w-3" />
                            Manage Conduits
                        </Button>
                    </div>
                    <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x mt-4">
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
                <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-500" />
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
                <Button variant="outline" className="rounded-2xl font-bold border-2 px-8 h-12 hover:bg-slate-900 hover:text-white transition-all">
                    Contact Support
                </Button>
            </div>
        </div>
    );
}
