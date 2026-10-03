"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AboutHero: React.FC = () => {
    return (
        <section className="relative overflow-hidden min-h-screen flex items-center pt-32 pb-24 lg:pt-40 lg:pb-32 bg-blue-950 dark:bg-slate-950 font-['Lexend']">
            <div className="max-w-[1440px] mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <div className="flex items-center gap-1 text-yellow-400">
                                {[1,2,3,4,5].map(i => <span key={i} className="text-sm">★</span>)}
                            </div>
                            <span className="text-white/80 text-sm font-semibold tracking-wide">4.9 • 5K+ Reviews</span>
                        </motion.div>
                        
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] text-white tracking-tight uppercase">
                            NEXT — GEN TOP NOTCH <span className="text-blue-500">SCHOOL</span> SOLUTION
                        </h1>
                        
                        <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 max-w-xl font-medium leading-relaxed">
                            We provide expert education management services to help schools grow, optimize operations, and achieve sustainable success.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6">
                            <Link href="/signup">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-transparent border border-white text-white pl-6 pr-2 py-2 rounded-full font-bold transition-all flex items-center gap-4 group hover:bg-white/5"
                                >
                                    Book Demo
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-blue-950 group-hover:rotate-45 transition-transform">
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </div>
                                </motion.button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-blue-950">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <div>
                                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider">CALL US</p>
                                    <p className="text-white font-bold">+234 816 524 6864</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative w-full h-[350px] sm:h-[400px] lg:h-full lg:min-h-[500px] mt-8 lg:mt-0">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute top-0 lg:top-1/2 lg:-translate-y-1/2 right-0 w-full lg:w-[120%] max-w-[800px] h-full lg:h-[600px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden"
                        >
                            <img 
                                src="/about/classroom 1.jpeg" 
                                alt="Modern Education" 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutHero;
