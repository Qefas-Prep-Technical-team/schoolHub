"use client";
import React from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const TrialBanner = () => {
    const { user } = useAuthStore();
    
    if (!user || user.plan === 'FREE') return null;
    if (user.subscriptionStatus !== 'ACTIVE' && Date.parse(user.trialEndsAt || '') < Date.now()) return null;

    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const now = new Date();
    
    if (!trialEndsAt || trialEndsAt < now) return null;

    const diffTime = Math.abs(trialEndsAt.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="mb-6 group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-600/20">
                <div className="relative bg-white dark:bg-slate-900 rounded-[14px] p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all group-hover:bg-transparent duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-lexend font-black text-slate-900 dark:text-white group-hover:text-white transition-colors">
                                {user.plan} <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-200">Trial Active</span>
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors">
                                You have <span className="font-bold text-slate-900 dark:text-white group-hover:text-white">{diffDays} days</span> remaining to explore full premium potential.
                            </p>
                        </div>
                    </div>
                    
                    <Link 
                        href="/dashboard/admin/billing"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-105 transition-all shadow-xl group-hover:bg-white group-hover:text-blue-700"
                    >
                        Upgrade Now
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};
