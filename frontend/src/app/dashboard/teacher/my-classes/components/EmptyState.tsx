import { Users, FilterX, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    onResetFilters: () => void;
}

export default function EmptyState({ onResetFilters }: EmptyStateProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative z-10">
                    <GraduationCap className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                </div>
                <div className="absolute top-0 right-0 -mr-2 -mt-2 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center border-4 border-background-light dark:border-background-dark z-20">
                    <FilterX className="w-3 h-3 text-white" />
                </div>
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 transform -z-10 animate-pulse"></div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
                No Academic Classes Found
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Your current filters didn't return any matches. Try relaxing your search criteria or create a fresh curriculum.
            </p>

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onResetFilters}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg transition-all active:scale-95"
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