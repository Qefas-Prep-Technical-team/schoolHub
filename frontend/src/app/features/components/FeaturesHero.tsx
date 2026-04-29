"use client"
import React from 'react';
import { motion } from 'framer-motion';

const FeaturesHero: React.FC = () => {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-50 dark:bg-slate-950 font-['Lexend']">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="max-w-3xl">
                    <motion.span 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider"
                    >
                        Education Reimagined
                    </motion.span>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight"
                    >
                        Powerful Features for <br />
                        <span className="text-blue-600">Modern Education</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed"
                    >
                        Streamline administrative tasks, engage students, and empower educators with a unified platform designed for the next generation of learning environments.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group">
                            Explore Features 
                            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">arrow_downward</span>
                        </button>
                        <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            View Demo
                        </button>
                    </motion.div>
                </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
                <div className="relative w-full h-full">
                    <motion.img 
                        initial={{ opacity: 0, scale: 1.1, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="w-full h-[600px] object-cover rounded-bl-[120px] shadow-2xl" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLv3mP0ymLHGX4txGVNJTL-HnF_Jr90MjCAscF2VRK83u77XyN1g2WxnffLw43cX5Lf-I439x99PzXBMkmPnCM9LVuHY8oR22Znf-TySFkJfuBvjyEAWxAO1jhFlMtP_Qpkb_yhVbZRo4fA9zgxFiBkQ2MX86K3pT3jZe9cL1eOP3uwfXiQzM7eSVQ8m9bguuYY6S5th2-afbRgZLQmtVTFb4uDcrsqfOHMKnFCd1kSDZKKLOFPuuulZHwD-1XBMKDYoVcuL0YI3M" 
                        alt="Modern collaborative workspace"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -30, y: 30 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-[280px] backdrop-blur-md"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Avg. Performance</p>
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">+24%</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Increased student engagement since implementing smart tracking.</p>
                    </motion.div>
                </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </section>
    );
};

export default FeaturesHero;
