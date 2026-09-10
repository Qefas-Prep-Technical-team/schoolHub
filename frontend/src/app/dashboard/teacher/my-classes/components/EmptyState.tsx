import { FilterX, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    onResetFilters: () => void;
}

export default function EmptyState({ onResetFilters }: EmptyStateProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-slate-200 dark:border-emerald-800/50 rounded-2xl bg-slate-50/50 dark:bg-emerald-950/60/10"
        >
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-emerald-900/40 flex items-center justify-center relative z-10">
                    <GraduationCap className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                No Academic Classes Found
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Your current filters didn&apos;t return any matches. Try relaxing your search criteria or create a fresh curriculum.
            </p>

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onResetFilters}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-emerald-900/40 text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-emerald-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg transition-all active:scale-95"
                >
                    <FilterX size={14} />
                    Reset All Filters
                </button>

                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">
                    Standard Academic Registry Procedures
                </p>
            </div>
        </motion.div>
    );
}
