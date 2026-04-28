
import GetStartedRoleSelect from '@/components/signUp/GetStartedRoleSelect';
import HeroSection from '@/components/signUp/HeroSection';
import React, { FC } from 'react';
import Link from 'next/link';

const page: FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-500/30">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
                <HeroSection />
                
                <div className="mt-16">
                    <GetStartedRoleSelect />
                </div>

                <div className="flex flex-col items-center gap-6 mt-12">
                    <Link href="/login">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer flex items-center gap-2 group">
                            Already have an account? 
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline decoration-2 underline-offset-4 decoration-indigo-500/30">Login</span>
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400/60 dark:text-slate-500/40">
                        <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of service</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
                        <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy policy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;
