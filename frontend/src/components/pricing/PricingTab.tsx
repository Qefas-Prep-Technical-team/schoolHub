import * as React from 'react';
import Box from '@mui/material/Box';
import EachPriceCard from './EachPriceCard';
import { useFetchPricing } from './query';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { pricingResolver } from '@/lib/pricingResolver';
import { usePublicPlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';

interface PricingTabProps {
    billingType: 'monthly' | 'yearly';
    setBillingType: (type: 'monthly' | 'yearly') => void;
    isUpgradeFlow?: boolean;
    currentPlanPrice?: number;
    lastPaymentDate?: string | Date | null;
}

export default function PricingTab({
    billingType,
    setBillingType,
    isUpgradeFlow,
    currentPlanPrice,
    lastPaymentDate
}: PricingTabProps) {
    const queryClient = useQueryClient();
    const { data: rawData, isLoading } = useFetchPricing();
    const { data: settings } = usePublicPlatformSettings();
    const data = React.useMemo(() => pricingResolver(rawData), [rawData]);
    const { userType, isAuthenticated } = useAuthStore();
    const [value, setValue] = React.useState(0);

    const categories = React.useMemo(() => {
        const allCategories = ['students', 'parents', 'schools', 'teachers'];
        
        // Helper to check if a category is enforced
        const isEnforced = (cat: string) => settings?.[`sub_enforced_${cat}`] !== "false";

        if (!isAuthenticated || !userType) {
            // For guest, show only enforced categories
            return allCategories.filter(isEnforced);
        }

        let userCategory = '';
        switch (userType) {
            case 'PARENT':   userCategory = 'parents'; break;
            case 'STUDENT':  userCategory = 'students'; break;
            case 'TEACHER':  userCategory = 'teachers'; break;
            case 'ADMIN':    userCategory = 'schools'; break;
        }

        if (userCategory && !isEnforced(userCategory)) {
            // If user's own category is disabled, show ALL OTHER enforced categories
            return allCategories.filter(cat => cat !== userCategory && isEnforced(cat));
        }

        // Default behavior: show only user's category if authenticated
        switch (userType) {
            case 'PARENT':   return ['parents'];
            case 'STUDENT':  return ['students'];
            case 'TEACHER':  return ['teachers'];
            case 'ADMIN':    return ['schools'];
            default:         return allCategories.filter(isEnforced);
        }
    }, [isAuthenticated, userType, settings]);

    React.useEffect(() => {
        if (value >= categories.length) setValue(0);
    }, [categories, value]);

    const filteredData = data?.find((d: any) => 
        d.category?.toLowerCase() === categories[value]?.toLowerCase()
    );

    const categoryLabels: Record<string, string> = {
        students: 'Students',
        parents: 'Parents',
        schools: 'Schools',
        teachers: 'Teachers',
    };

    return (
        <Box className="w-full flex flex-col items-center">

            {/* Category Switcher — only show when more than one category */}
            {categories.length > 1 && (
                <div className="flex items-center justify-center mb-12 p-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 rounded-2xl">
                    {categories.map((cat, index) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setValue(index);
                                queryClient.invalidateQueries({ queryKey: ['fetchPricing'] });
                            }}
                            className={`relative px-6 py-2.5 text-sm font-bold capitalize transition-all duration-200 rounded-xl
                                ${value === index
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            {categoryLabels[cat] ?? cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Cards Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={value}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full max-w-6xl"
                >
                    {isLoading ? (
                        /* Skeleton loaders */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[520px] rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={`grid gap-6
                            ${filteredData?.tabs.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : ''}
                            ${filteredData?.tabs.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : ''}
                            ${(filteredData?.tabs.length ?? 0) >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
                        `}>
                            {filteredData?.tabs.map((tab, index) => (
                                <EachPriceCard
                                    key={tab.type}
                                    {...tab}
                                    category={filteredData.category}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

        </Box>
    );
}
