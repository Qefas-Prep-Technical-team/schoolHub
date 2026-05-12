"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Info, Calendar, CreditCard } from 'lucide-react';

export default function UpgradeExplanation() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-6 rounded-[2rem] flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight">Under 15 Days Usage</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        Pay only the <span className="text-blue-600 font-bold">difference</span> between your plans. Your current billing cycle continues uninterrupted.
                    </p>
                </div>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-6 rounded-[2rem] flex gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <CreditCard className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight">After 15 Days Usage</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        The full price is applied, and your <span className="text-amber-600 font-bold">billing cycle resets</span> today for a fresh 30-day/1-year period.
                    </p>
                </div>
            </div>

            <div className="md:col-span-2 bg-slate-900 dark:bg-white p-4 rounded-2xl flex items-center justify-center gap-3">
                <Info className="w-5 h-5 text-blue-400 dark:text-blue-600" />
                <p className="text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest text-center">
                    All upgrades are processed securely via Secure Gateway with instant activation
                </p>
            </div>
        </motion.div>
    );
}
