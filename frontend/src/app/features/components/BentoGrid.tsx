"use client"
import React from 'react';
import { motion } from 'framer-motion';

const BentoGrid: React.FC = () => {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 font-['Lexend']">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-[300px]">
                    
                    {/* AI Insights */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200/50 dark:border-slate-800 p-8 md:p-12 flex flex-col md:flex-row gap-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-700"
                    >
                        <div className="flex-1 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black mb-6 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-xs">bolt</span> AI Powered
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">AI Insights</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 max-w-sm leading-relaxed">
                                Our predictive engine identifies learning gaps before they become hurdles, offering personalized paths for every student.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Predictive student analytics",
                                    "Personalized learning recommendations"
                                ].map((text, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">check_circle</span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl relative overflow-hidden hidden md:block shadow-inner">
                            <motion.img 
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA34MgGhq7NXGuIZCbeqdnCwFkqz2MvA2cMS7iDoVHE1hcN6Fe5g9uzwTUb-8qLTYnEiXyVJyK88_0vGPelKXb9pU9Tq1QCQexcXnegPRtI0MpE73Gtcb7M6jOI-1s3KR1AyTy-oBrG3LJ2KVxrGdfP3YBTrVzO5Sy4OU2Fv31LsovfCFmdcdWEIxUOPtxqT3EFzLXe_KFQcujXuDIg9jJeLwBlJj7BN1JJBVJOOTcBU2lGPgIKkN9zEXH0MNrF54uay-xg8v996qs" 
                                alt="AI Dashboard"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 via-transparent to-transparent"></div>
                        </div>
                    </motion.div>

                    {/* Resource Library Large Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 bg-blue-600 rounded-[3rem] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-xl shadow-blue-600/20"
                    >
                        <div className="z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-4xl">auto_stories</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4 leading-tight">Resource Library</h3>
                            <p className="text-white/80 text-sm font-medium leading-relaxed">
                                Centralized repository for digital textbooks, multimedia tutorials, and exam archives.
                            </p>
                        </div>
                        <div className="z-10 bg-white/10 p-6 rounded-2xl border border-white/20 mt-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                                <span>Repository Syncing</span>
                                <span>85%</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "85%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-white"
                                ></motion.div>
                            </div>
                        </div>
                        {/* Abstract texture */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M0 100 Q 50 0 100 100" fill="none" stroke="white" strokeWidth="0.5"></path>
                                <path d="M0 80 Q 50 -20 100 80" fill="none" stroke="white" strokeWidth="0.5"></path>
                            </svg>
                        </div>
                    </motion.div>

                    {/* Small detail cards */}
                    {[
                        { icon: "description", title: "Study Materials", text: "Over 15,000 verified resources" },
                        { icon: "devices", title: "Cross-Platform Access", text: "Web, iOS, and Android sync" },
                        { icon: "security", title: "Role-based Access", text: "Secure content control" }
                    ].map((card, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm flex items-center gap-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                            </div>
                            <div>
                                <h5 className="font-black text-slate-900 dark:text-white">{card.title}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mt-1">{card.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BentoGrid;
