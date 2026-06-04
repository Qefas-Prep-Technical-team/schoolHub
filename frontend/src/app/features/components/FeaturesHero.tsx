"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle, TrendingUp } from 'lucide-react';

const FeaturesHero: React.FC = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center py-20 lg:py-32 overflow-hidden bg-white dark:bg-slate-950 font-['Lexend'] border-b border-slate-100 dark:border-slate-800/50">
            {/* Ambient Backgrounds */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col lg:flex-row items-center gap-16">
                <div className="max-w-3xl lg:w-1/2">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Education Reimagined</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight"
                    >
                        Powerful Features for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Modern Education
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed font-light"
                    >
                        Streamline administrative tasks, engage students, and empower educators with a unified platform designed for the next generation of learning environments.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group">
                            Explore Features 
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                            <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            View Demo
                        </button>
                    </motion.div>
                </div>

                {/* Right Side Visuals */}
                <div className="w-full lg:w-1/2 relative hidden md:block mt-12 lg:mt-0">
                    <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                            className="absolute inset-0 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800"
                        >
                            <img 
                                className="w-full h-full object-cover" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLv3mP0ymLHGX4txGVNJTL-HnF_Jr90MjCAscF2VRK83u77XyN1g2WxnffLw43cX5Lf-I439x99PzXBMkmPnCM9LVuHY8oR22Znf-TySFkJfuBvjyEAWxAO1jhFlMtP_Qpkb_yhVbZRo4fA9zgxFiBkQ2MX86K3pT3jZe9cL1eOP3uwfXiQzM7eSVQ8m9bguuYY6S5th2-afbRgZLQmtVTFb4uDcrsqfOHMKnFCd1kSDZKKLOFPuuulZHwD-1XBMKDYoVcuL0YI3M" 
                                alt="Modern collaborative workspace"
                            />
                            {/* Inner Overlay for contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                        </motion.div>
                        
                        {/* Floating Stats Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30, y: 30 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8, ease: "backOut" }}
                            className="absolute -bottom-8 -left-8 md:bottom-8 md:-left-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 max-w-[280px]"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-inner">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Avg. Performance</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">+24%</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Increased student engagement since implementing smart tracking.</p>
                        </motion.div>

                        {/* Floating Element 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1, ease: "backOut" }}
                            className="absolute -top-6 -right-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3"
                        >
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">System Active</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesHero;
