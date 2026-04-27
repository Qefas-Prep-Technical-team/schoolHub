"use client"
import React from 'react';
import { motion } from 'framer-motion';

const OurStory: React.FC = () => {
    return (
        <section className="py-24 bg-slate-100/50 dark:bg-slate-900/30 overflow-hidden font-['Lexend']">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1 relative group"
                    >
                        <div className="absolute -inset-8 bg-blue-600/5 rounded-[4rem] group-hover:scale-105 transition-transform duration-700"></div>
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white dark:border-slate-800">
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFpehStNLL0Nnl7rXBeQBY5ONL0mZOfhcVCCe9lUyqXNg5TW-AwyjeVVYOnTfO7OpFLH7cEEWc3rxke-V0_itfWFAzEJ797cEXLS-IMv-oVMxTqC2KII7hB_Ine_3Z3Ed39ku_89tF5l5PLNReQpv7i7svtgZh--K6pkuH9QJgJZKJQrhsacSXL9iJtGHG_Rz3Qsz_GiCn4H1_j5LJNKfJDF4PL0M448E2AoRP0DsDd55QYwEknKvrwHi8mzUSZFKdYT5n9gqGvQM" 
                                alt="Team meeting" 
                                className="w-full h-[650px] object-cover hover:scale-110 transition-transform duration-[2s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                        </div>
                    </motion.div>

                    <div className="order-1 lg:order-2">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-xs mb-4 block"
                        >
                            Since 2012
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight"
                        >
                            Our Story & <br />
                            <span className="text-blue-600">Commitment</span>
                        </motion.h2>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6 text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
                        >
                            <p>Qefas Hub began in a small university lab with a simple observation: administrators were spending 40% of their time on repetitive manual data entry instead of supporting students.</p>
                            <p>We started with a single module for grade tracking. Ten years later, we have evolved into a comprehensive platform that manages everything from enrollment and curriculum planning to parent-teacher communication and financial reporting.</p>
                            <p>Our commitment remains unchanged: to provide the most reliable, innovative, and user-centric management tools in the education sector. We believe that when administration is easy, excellence is inevitable.</p>
                        </motion.div>

                        <div className="mt-12 grid grid-cols-2 gap-12 border-t border-slate-200 dark:border-slate-800 pt-12">
                            {[
                                { value: "12+", label: "Years of Innovation" },
                                { value: "99.9%", label: "Uptime Reliability" }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                    <p className="text-4xl md:text-5xl font-black text-blue-600 dark:text-blue-400 mb-2">{stat.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurStory;
