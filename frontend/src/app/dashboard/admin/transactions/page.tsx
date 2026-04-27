"use client"
import React, { useState } from 'react';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { motion } from 'framer-motion';
import { useSchoolBilling } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTransactionsPage() {
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { data: billingData, isLoading } = useSchoolBilling(schoolId as string, {
        page: currentPage,
        limit: ITEMS_PER_PAGE
    });

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-96 w-full rounded-[2.5rem]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2"
            >
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-['Lexend'] tracking-tight">
                    Billing & Transactions
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium font-['Lexend']">
                    Manage your school's subscription and view payment history.
                </p>
            </motion.div>

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
