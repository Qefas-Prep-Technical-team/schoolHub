"use client"
import React from 'react';
import { motion } from 'framer-motion';

const AcademicManagement: React.FC = () => {
    const features = [
        {
            title: "Automated Grading",
            description: "Instant feedback and automated assessment grading for multiple-choice and structured questions.",
            icon: "auto_stories"
        },
        {
            title: "Attendance Tracking",
            description: "Biometric and RFID integration for real-time attendance logs with instant parent notifications.",
            icon: "how_to_reg"
        },
        {
            title: "Smart Timetabling",
            description: "Conflict-free schedule generation optimized for classroom availability and teacher workloads.",
            icon: "calendar_month"
        }
    ];

    return (
        <section id="features-list" className="py-24 bg-slate-100/50 dark:bg-slate-900/30 font-['Lexend'] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4"
                        >
                            Academic Management
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-600 dark:text-slate-400"
                        >
                            Precision tools designed to eliminate administrative friction and let educators focus on what matters most: teaching.
                        </motion.p>
                    </div>
                    <motion.span 
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        whileInView={{ opacity: 0.15, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        className="material-symbols-outlined text-slate-900 dark:text-white text-8xl hidden md:block"
                    >
                        school
                    </motion.span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="group bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                                <span className="material-symbols-outlined text-3xl font-light">{feature.icon}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                            
                            <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                <span>Learn more</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AcademicManagement;
