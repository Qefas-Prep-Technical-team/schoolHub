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
    Users,
    BookOpenCheck
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

export default function TeacherBillingPage() {
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
    
    // Plan limits mapping for teachers
    const planLimits = {
        PRO: { classes: 100, students: 1000 },
        ESSENTIAL: { classes: 5, students: 200 },
        FREE: { classes: 1, students: 50 }
    };

    const currentLimits = planLimits[plan as keyof typeof planLimits] || planLimits.FREE;
    
    const cycle = subscription?.billingCycle || "monthly";

    // Dynamic pricing retrieval
    const teacherPricing = pricingData?.find((d: PricingData) => d.category === 'teachers');
    const activePlanData = teacherPricing?.tabs.find((t: any) => t.type.toLowerCase() === plan.toLowerCase());
    const dynamicAmount = activePlanData 
        ? (cycle === 'monthly' ? activePlanData.pricing.monthly : activePlanData.pricing.yearly) 
        : 0;

    const subscriptionInfo = {
        plan: subscription?.plan || "Educator Free",
        status: subscription?.subscriptionStatus || "INACTIVE",
        renewalDate: subscription?.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString() : "N/A",
        amount: dynamicAmount,
        billingCycle: cycle,
        features: activePlanData?.features || [
                "Single Class Management",
                "Basic Quiz Maker",
                "Lesson Planner",
                "Result Entry"
            ]
    };

    const classPercentage = Math.min(((usage?.classes || 0) / currentLimits.classes) * 100, 100);
    const studentPercentage = Math.min(((usage?.students || 0) / currentLimits.students) * 100, 100);

    return (
        <div className="space-y-8 pb-12 p-6 lg:p-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Educator Subscription
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Manage your professional tools and classroom capacity.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl font-bold border-2 h-12 px-6"
                        onClick={() => router.push('/pricing?role=teacher')}
                    >
                        Upgrade Tools
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50">
                    <CardHeader className="bg-indigo-600 dark:bg-indigo-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-2">
                                <Badge className="bg-white/20 text-white border-none px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                                    Active Toolset
                                </Badge>
                                <CardTitle className="text-4xl font-black capitalize">{subscriptionInfo.plan}</CardTitle>
                                <CardDescription className="text-indigo-100 font-medium text-lg">
                                    Professional Grade Educator Plan
                                </CardDescription>
                            </div>
                            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                                <Zap className="w-10 h-10 text-white" />
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
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Next Renewal</p>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <span className="text-xl font-bold text-slate-900 dark:text-white">{subscriptionInfo.renewalDate}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Educator Privileges</p>
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
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-slate-900 text-white p-8">
                        <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Pricing</h4>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black tracking-tighter">₦{subscriptionInfo.amount.toLocaleString()}</span>
                            <span className="text-sm font-bold opacity-70">/ {subscriptionInfo.billingCycle}</span>
                        </div>
                        <p className="text-sm opacity-80 font-medium leading-relaxed">
                            Pro plans unlock unlimited class management and advanced student performance analytics.
                        </p>
                    </Card>

                    <Card className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl p-8 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white leading-tight">Capacity</h4>
                                <p className="text-xs text-slate-500 font-medium">System utilization</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-500">Managed Classes</span>
                                    <span className="text-slate-900 dark:text-white">{usage?.classes || 0} / {currentLimits.classes}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${classPercentage}%` }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-500">Student Connections</span>
                                    <span className="text-slate-900 dark:text-white">{usage?.students || 0} / {currentLimits.students}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${studentPercentage}%` }} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="space-y-6 mt-12">
                <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Transaction Archives
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
