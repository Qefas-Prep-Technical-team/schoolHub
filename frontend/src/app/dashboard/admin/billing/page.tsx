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
    Landmark
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
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                        Protocol & Tier
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                        Manage institutional subscription status and liquidity parameters
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-900 border-2 h-14 px-8 shadow-sm"
                        onClick={() => router.push('/dashboard/admin/billing/upgrade')}
                    >
                        Switch Protocol
                    </Button>
                    <Button className="rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary text-white h-14 px-8 shadow-xl shadow-primary/20">
                        Manage Settlement Methods
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                    <CardHeader className="bg-slate-900 dark:bg-black p-10 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-60 h-60 bg-primary/20 rounded-full blur-[80px]" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-4">
                                <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px]">
                                    Current Protocol
                                </Badge>
                                <div className="space-y-1">
                                    <CardTitle className="text-5xl font-black capitalize tracking-tighter italic">
                                        {subscriptionInfo.plan}
                                    </CardTitle>
                                    <p className="text-2xl font-black text-primary tracking-tighter">
                                        ₦{subscriptionInfo.amount.toLocaleString()} <span className="text-sm opacity-60 font-bold uppercase tracking-widest">/ {subscriptionInfo.billingCycle}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="h-16 w-16 bg-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10">
                                <ShieldCheck className="w-8 h-8 text-white" />
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
                    <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-gradient-to-br from-primary to-primary text-white p-10 relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                            <Zap size={100} />
                        </div>
                        <div className="mb-10 flex justify-between items-start relative z-10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                <Zap className="w-7 h-7 text-white" />
                            </div>
                            <Button size="sm" className="bg-white/10 hover:bg-white/20 border-none rounded-xl text-[9px] font-black uppercase tracking-widest">
                                Details
                            </Button>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Next Liquidity Event</h4>
                        <div className="flex items-baseline gap-2 mb-6 relative z-10">
                            <span className="text-5xl font-black tracking-tighter italic">₦{subscriptionInfo.amount.toLocaleString()}</span>
                            <span className="text-xs font-bold opacity-70 uppercase tracking-widest">/ {subscriptionInfo.billingCycle}</span>
                        </div>
                        <p className="text-xs opacity-70 font-medium leading-relaxed relative z-10">
                            {subscriptionInfo.status === 'ACTIVE' 
                                ? "Automatic protocol renewal scheduled. Ensure settlement methods are valid."
                                : "Initialize a subscription tier to continue accessing premium institutional conduits."}
                        </p>
                    </Card>

                    <UsageLimitsCard />
                </div>
            </div>

            {analytics?.accounts && analytics.accounts.length > 0 && (
                <div className="space-y-6 mt-12 bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <Landmark size={28} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Settlement Vault</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active conduits for automatic fee disbursements</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5 gap-2"
                            onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                        >
                            <Plus className="h-3 w-3" />
                            Manage Conduits
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
                            Liquidity Stream
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Historical record of all successfully processed transitions</p>
                    </div>
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

