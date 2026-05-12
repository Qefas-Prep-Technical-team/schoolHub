"use client"
import { Box } from '@mui/material';
import React, { FC } from 'react';
import { useFetchPricingFAQ } from './query';
import { PRICING_FAQ } from '@/lib/constants/plansData';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle, ArrowRight } from 'lucide-react';

const FrequentlyAskedQuestions: FC = () => {
    const { data: apiData } = useFetchPricingFAQ()
    const data = apiData || PRICING_FAQ;
    const [openIndex, setOpenIndex] = React.useState<string | null>(null);

    return (
        <Box className="container mx-auto px-6 py-32 relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[100px]" />
            </div>

            <Box className="max-w-4xl mx-auto w-full">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Common Questions
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                        Everything you need to know about Qefas Hub pricing and features.
                    </p>
                </div>

                <div className="space-y-4">
                    {data && data.map((item) => (
                        <div 
                            key={item.question}
                            className={`group rounded-3xl border-2 transition-all duration-300 ${
                                openIndex === item.question 
                                ? 'border-blue-600/20 bg-blue-50/30 dark:bg-blue-900/10' 
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === item.question ? null : item.question)}
                                className="w-full flex items-center justify-between p-8 text-left"
                            >
                                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                                    openIndex === item.question ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                                }`}>
                                    {item.question}
                                </h3>
                                <div className={`flex-shrink-0 ml-4 p-2 rounded-xl transition-all duration-300 ${
                                    openIndex === item.question ? 'bg-blue-600 text-white rotate-90' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                    {openIndex === item.question ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {openIndex === item.question && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </Box>

            {/* CTA Section */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="mt-40 max-w-5xl mx-auto p-12 rounded-[3.5rem] bg-slate-900 dark:bg-blue-600 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
                
                <div className="space-y-4 text-center md:text-left relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest">
                        <MessageCircle className="w-4 h-4" />
                        Support Available 24/7
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">
                        Still have questions?
                    </h2>
                    <p className="text-lg opacity-80 font-medium max-w-md">
                        Our consultative team is here to help you find the perfect operational plan for your institution.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    <button className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-100 transition-all flex items-center gap-3 active:scale-95">
                        Contact Sales
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </motion.div>
        </Box>
    );
};

export default FrequentlyAskedQuestions;
