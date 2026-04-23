import * as React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from 'next-themes';
import EachPriceCard from './EachPriceCard';
import { useFetchPricing } from './query';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingTabProps {
    billingType: 'monthly' | 'yearly';
    setBillingType: (type: 'monthly' | 'yearly') => void;
}

export default function PricingTab({ billingType, setBillingType }: PricingTabProps) {
    const queryClient = useQueryClient();
    const { data, isLoading } = useFetchPricing();
    const [value, setValue] = React.useState(0);
    const { theme } = useTheme();

    const categories = ['individuals', 'schools', 'teachers'];
    const filteredData = data?.find(d => d.category === categories[value]);

    return (
        <Box className="w-full flex flex-col items-center">
            {/* Category Switcher */}
            <div className="flex items-center justify-center mb-16 p-1.5 bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                {categories.map((cat, index) => (
                    <button
                        key={cat}
                        onClick={() => {
                            setValue(index);
                            queryClient.invalidateQueries({ queryKey: ['fetchPricing'] });
                        }}
                        className={`relative px-8 md:px-12 py-3 text-sm font-bold capitalize transition-all duration-300 rounded-xl ${
                            value === index 
                            ? 'text-white' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {value === index && (
                            <motion.div 
                                layoutId="category-pill"
                                className="absolute inset-0 bg-slate-900 dark:bg-blue-600 rounded-xl shadow-lg"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{cat}</span>
                    </button>
                ))}
            </div>

            {/* Bento Pricing Cards Grid */}
            <div className="w-full max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
                    >
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className={`h-[500px] rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700 ${i === 1 ? 'lg:-mt-8 lg:mb-8' : ''}`}></div>
                            ))
                        ) : (
                            filteredData?.tabs.map((tab, index) => (
                                <EachPriceCard 
                                    key={tab.type} 
                                    {...tab} 
                                    category={filteredData.category} 
                                    index={index}
                                />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Box>
    );
}
