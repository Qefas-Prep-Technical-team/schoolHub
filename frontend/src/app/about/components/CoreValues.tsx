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
        <section className="py-24 bg-white dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6"
                    >
                        Core Values
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium"
                    >
                        The principles that guide every feature we build and every partnership we form.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {values.map((value, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15 }}
                            className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-200/50 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 transform hover:-translate-y-4 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-10 shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12 border border-slate-100 dark:border-slate-700">
                                <span className="material-symbols-outlined text-4xl font-light">{value.icon}</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {value.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {value.description}
                            </p>
                            
                            <div className="mt-10 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                <span>Learn our process</span>
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
