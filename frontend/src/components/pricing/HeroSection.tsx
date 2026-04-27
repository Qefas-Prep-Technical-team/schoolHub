import React, { FC } from 'react';
import { motion } from 'framer-motion';

const HeroSection: FC = () => {
    return (
        <div className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Trusted by 500+ Schools
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Transparent Pricing for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Modern Education
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        Whether you are an independent educator or a large institution, Qefas Hub provides the tools you need to excel. Scale your school with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <div className="flex items-center -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                +5k
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Join over <span className="text-slate-900 dark:text-white">5,000+ users</span> globally
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
