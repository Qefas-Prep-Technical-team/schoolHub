"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AboutCTA: React.FC = () => {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-blue-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30 group"
                >
                    {/* Animated background blobs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl transition-transform group-hover:scale-110 duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl transition-transform group-hover:scale-110 duration-1000"></div>
                    
                    <div className="relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[40px] md:text-[64px] font-black mb-8 leading-tight tracking-tight"
                        >
                            Join 500+ Institutions <br className="hidden md:block" /> 
                            Worldwide
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/80 font-medium leading-relaxed"
                        >
                            Ready to transform your institution's administrative workflow? Start your 30-day free trial today and experience the future of education management.
                        </motion.p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link href="/signup">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-xl"
                                >
                                    Get Started Now
                                </motion.button>
                            </Link>
                            <Link href="/contact">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                                >
                                    Schedule a Demo
                                </motion.button>
                            </Link>
                        </div>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 text-sm font-black text-white/60 uppercase tracking-[0.2em] flex items-center justify-center gap-4"
                        >
                            <span>No credit card required</span>
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                            <span>Unlimited users</span>
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                            <span>Full support</span>
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutCTA;
