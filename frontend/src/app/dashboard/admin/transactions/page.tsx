"use client"

import React, { useState } from 'react';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { useSchoolBilling } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AdminTransactionsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const { data: billingData, isLoading } = useSchoolBilling(schoolId as string, {
        page: currentPage,
        limit: ITEMS_PER_PAGE
    });

    if (isLoading) {
        return (
            <div className="space-y-8 max-w-[1600px] mx-auto">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-12 w-1/3 rounded-xl" />
                </div>
                <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Button 
                        variant="ghost" 
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-4"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft size={20} className="mr-2" /> Return
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Audit Log
                            </h1>
                            <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full border border-indigo-500/20 mt-1">
                                <History className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Immutable History</span>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                            Comprehensive ledger of all institutional financial transitions
                        </p>
                    </div>
                </div>
            </div>

            <TransactionHistory 
                items={billingData?.transactions || []} 
                totalItems={billingData?.totalTransactions || 0}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
