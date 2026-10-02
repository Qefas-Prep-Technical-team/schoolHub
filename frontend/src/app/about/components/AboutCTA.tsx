"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AboutCTA: React.FC = () => {
    return (
        <section className="py-24 bg-blue-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center text-white relative"
                >
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[40px] md:text-[64px] font-bold mb-8 leading-[1.1] tracking-tight uppercase"
                        >
                            Join 5K+ Institutions <br className="hidden md:block" /> 
                            <span className="text-blue-500">Worldwide</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/80 font-medium leading-relaxed"
                        >
                            Ready to transform your institution's administrative workflow? Start your free trial today and experience the future of education management.
                        </motion.p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link href="/signup">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-transparent border border-white text-white pl-6 pr-2 py-2 rounded-full font-bold transition-all flex items-center gap-4 group hover:bg-white/5"
                                >
                                    Get Started Now
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-blue-950 group-hover:rotate-45 transition-transform">
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </div>
                                </motion.button>
                            </Link>
                            <Link href="/contact">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-transparent border border-white/30 text-white/80 px-8 py-3.5 rounded-full font-bold transition-all hover:bg-white/10"
                                >
                                    Schedule a Demo
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutCTA;
