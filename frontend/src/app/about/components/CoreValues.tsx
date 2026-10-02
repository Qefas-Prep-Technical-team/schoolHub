"use client"
import React from 'react';
import { motion } from 'framer-motion';

const CoreValues: React.FC = () => {
    const values = [
        {
            title: "Transparency",
            description: "Honesty in our data practices and clear communication with our partners. No hidden fees, no hidden agendas.",
            icon: "policy"
        },
        {
            title: "Innovation",
            description: "Constantly evolving our toolkit with AI and machine learning to predict student needs and optimize resources.",
            icon: "lightbulb"
        },
        {
            title: "Excellence",
            description: "We set the gold standard for educational software, ensuring every pixel and every line of code serves a purpose.",
            icon: "star"
        }
    ];

    return (
        <section className="py-24 bg-[#FDFBF7] dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-sm">diamond</span>
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Our Services</span>
                    </div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
                    >
                        Experienced best modern <br /> core values
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-600 dark:text-slate-400 max-w-2xl font-medium"
                    >
                        The principles that guide every feature we build and every partnership we form.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {values.map((value, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15 }}
                            className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col"
                        >
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
                                <span className="material-symbols-outlined text-2xl text-blue-950 font-bold">{value.icon}</span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-500 transition-colors">
                                {value.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-1">
                                {value.description}
                            </p>
                            
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm hover:text-blue-500 transition-colors cursor-pointer w-fit">
                                <span>Read More</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoreValues;
