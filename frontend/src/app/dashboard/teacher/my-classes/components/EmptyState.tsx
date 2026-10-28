import React from 'react';
import { FilterX, GraduationCap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    onResetFilters: () => void;
    hasActiveFilters?: boolean;
    totalClasses?: number;
}

export default function EmptyState({ 
    onResetFilters, 
    hasActiveFilters = true,
    totalClasses = 0 
}: EmptyStateProps) {
    const isFiltered = hasActiveFilters && totalClasses > 0;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-slate-200 dark:border-emerald-800/60 rounded-3xl bg-slate-50/60 dark:bg-emerald-950/20 backdrop-blur-sm relative overflow-hidden"
        >
            {/* Subtle Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-700/60 flex items-center justify-center relative z-10 shadow-sm shadow-emerald-500/10">
                    <GraduationCap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {isFiltered ? "No Matching Classes Found" : "No Academic Classes Assigned"}
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-center max-w-md mb-8 text-xs font-medium leading-relaxed">
                {isFiltered 
                    ? "Your active filters didn't return any classes. Relax your search criteria or reset your filters to see all assigned classes."
                    : "You have not been assigned to any classes yet. When your school administrator assigns you to a cohort or subject section, it will appear here automatically."}
            </p>

            <div className="flex flex-col items-center gap-4 relative z-10">
                {isFiltered ? (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        <FilterX size={15} />
                        Reset All Filters
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-emerald-700/60 transition-all active:scale-95 cursor-pointer"
                    >
                        <RefreshCw size={14} className="text-emerald-500" />
                        Refresh Class List
                    </button>
                )}

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">
                    Academic Registry Roster
                </p>
            </div>
        </motion.div>
    );
}
