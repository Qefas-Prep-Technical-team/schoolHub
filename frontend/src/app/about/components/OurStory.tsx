"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const OurStory: React.FC = () => {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden font-['Lexend']">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left: Bento Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="col-span-2 rounded-[2rem] overflow-hidden h-[300px]"
                        >
                            <img 
                                src="/about/classrooom 2.jpeg" 
                                alt="Teachers meeting" 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-blue-500 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center h-[240px]"
                        >
                            <div className="w-10 h-10 bg-blue-950 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-blue-500 text-sm">check</span>
                            </div>
                            <h3 className="text-4xl font-bold text-blue-950 mb-2">5K+</h3>
                            <p className="text-blue-950/80 text-sm font-semibold max-w-[120px]">Active Schools Enrolled</p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="rounded-[2rem] overflow-hidden h-[240px]"
                        >
                            <img 
                                src="/about/about user 1.jpeg" 
                                alt="Students" 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </motion.div>
                    </div>

                    {/* Right: Text and Content */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Who We are?</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-[1.1]">
                            Comprehensive solution for educational excellence
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-10 text-base font-medium leading-relaxed">
                            Discover innovative management strategies that help schools improve operations, increase profitability, and achieve long-term growth in a competitive academic landscape all over the world.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6 mb-12">
                            <Link href="/about/story">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-6 pr-2 py-2 rounded-full font-bold transition-all flex items-center gap-4 group"
                                >
                                    More About Us
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-blue-950 group-hover:rotate-45 transition-transform">
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </div>
                                </motion.button>
                            </Link>
                            
                            <div className="flex items-center gap-3">
                                <img src="/about/about user 2.jpeg" alt="CEO" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="text-slate-900 dark:text-white font-bold">Idris O. Sadiq</p>
                                    <p className="text-slate-500 text-xs font-semibold">CEO at Qefas</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#FDFBF7] dark:bg-slate-900 rounded-[1.5rem] p-6">
                                <div className="flex text-yellow-400 text-sm mb-2">
                                    {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                                </div>
                                <div className="flex items-end gap-1 mb-2">
                                    <h4 className="text-4xl font-bold text-slate-900 dark:text-white leading-none">4.9</h4>
                                    <span className="text-sm text-slate-500 font-bold">/5.0</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg. clients ratings</p>
                            </div>
                            
                            <div className="bg-[#FDFBF7] dark:bg-slate-900 rounded-[1.5rem] p-6">
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Premium features</p>
                                <div className="flex flex-wrap gap-2">
                                    {["ADVISING", "GRADING", "TIMETABLES", "PAYMENTS"].map((skill, i) => (
                                        <span key={i} className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default OurStory;
