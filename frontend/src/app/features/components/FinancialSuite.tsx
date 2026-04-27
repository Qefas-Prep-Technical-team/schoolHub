"use client"
import React from 'react';
import { motion } from 'framer-motion';

const FinancialSuite: React.FC = () => {
    return (
        <section className="py-24 bg-slate-900 text-white font-['Lexend'] overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="max-w-2xl mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black mb-6"
                    >
                        Financial Suite
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-400 font-medium leading-relaxed"
                    >
                        Secure, transparent, and fully automated financial management designed specifically for educational institutions.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Paystack Integration */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm group hover:bg-white/10 transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-blue-500 text-5xl mb-8 group-hover:scale-110 transition-transform">payments</span>
                        <h4 className="text-xl font-bold mb-3">Instant Settlements</h4>
                        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                            Process tuition, lab fees, and field trips with our secure automated gateway. Direct and instant.
                        </p>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: "99.9%" }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-blue-500"
                            ></motion.div>
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <span>Transaction Success</span>
                            <span className="text-blue-500">99.9%</span>
                        </div>
                    </motion.div>

                    {/* Automated Invoicing */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm group hover:bg-white/10 transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-blue-500 text-5xl mb-8 group-hover:scale-110 transition-transform">receipt_long</span>
                        <h4 className="text-xl font-bold mb-3">Automated Invoicing</h4>
                        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                            Recurring billing engine that generates and sends invoices based on custom fee structures automatically.
                        </p>
                        <div className="flex items-center gap-2 text-blue-500 font-bold text-sm cursor-pointer group-hover:gap-4 transition-all">
                            <span>Learn more</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                    </motion.div>

                    {/* Financial Reporting */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm group hover:bg-white/10 transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-blue-500 text-5xl mb-8 group-hover:scale-110 transition-transform">analytics</span>
                        <h4 className="text-xl font-bold mb-3">Financial Reporting</h4>
                        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                            Comprehensive ledgers, aging reports, and cash flow forecasts updated in real-time.
                        </p>
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col gap-1">
                            <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">New Feature</span>
                            <span className="text-sm font-bold">End-of-term tax summaries</span>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Abstract background shape */}
            <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-blue-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </section>
    );
};

export default FinancialSuite;
