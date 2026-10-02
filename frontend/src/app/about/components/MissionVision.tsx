"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MissionVision: React.FC = () => {
    return (
        <section className="py-24 bg-[#FDFBF7] dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Our Approach</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                            Essential pillars for modern school success
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                        Explore integrated school management approaches to improve processes, increase productivity, and support long-term educational development.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Card 1 - White */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-[400px]"
                    >
                        <div>
                            <div className="mb-6">
                                <span className="material-symbols-outlined text-4xl text-slate-700 dark:text-slate-300">school</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                Empowering schools to focus on teaching by simplifying administration. We replace complex logistics with fluid, automated systems.
                            </p>
                        </div>
                        <Link href="/about/mission" className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full w-fit text-sm font-bold hover:bg-slate-100 transition-colors">
                            Explore More <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                    </motion.div>

                    {/* Card 2 - Light Blue */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-blue-500 p-10 rounded-[2rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-[400px] relative overflow-hidden"
                    >
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 border-[40px] border-white/20 rounded-full"></div>
                        <div className="relative z-10">
                            <div className="mb-6">
                                <span className="material-symbols-outlined text-4xl text-blue-950">visibility</span>
                            </div>
                            <h3 className="text-2xl font-bold text-blue-950 mb-4">Our Vision</h3>
                            <p className="text-blue-950/80 text-sm font-medium leading-relaxed">
                                A unified ecosystem where schools, teachers, parents, and students thrive in a seamless digital continuum, fostering a culture of academic excellence.
                            </p>
                        </div>
                        <Link href="/about/vision" className="relative z-10 inline-flex items-center gap-2 bg-blue-950/10 px-4 py-2 rounded-full w-fit text-sm font-bold text-blue-950 hover:bg-blue-950/20 transition-colors">
                            Explore More <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                    </motion.div>

                    {/* Card 3 - Dark Blue */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-950 p-10 rounded-[2rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-[400px]"
                    >
                        <div>
                            <div className="mb-6">
                                <span className="material-symbols-outlined text-4xl text-blue-500">handshake</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">School Process Improvement</h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed">
                                Optimize workflows to increase efficiency, productivity, and performance across every department of your educational institution.
                            </p>
                        </div>
                        <Link href="/features" className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full w-fit text-sm font-bold text-white hover:bg-white/20 transition-colors">
                            Explore More <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default MissionVision;
