"use client"
import React from 'react';
import { motion } from 'framer-motion';

const AboutHero: React.FC = () => {
    return (
        <section className="relative overflow-hidden py-24 lg:py-32 bg-slate-50 dark:bg-slate-950 font-['Lexend']">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 mb-6 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-black uppercase tracking-wider"
                        >
                            Our Purpose
                        </motion.span>
                        
                        <h1 className="text-[48px] md:text-[64px] font-black mb-6 leading-[1.1] bg-gradient-to-br from-slate-900 via-blue-800 to-blue-600 dark:from-white dark:via-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                            Bridging the Gap in <br /> 
                            Education Management
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl font-medium leading-relaxed">
                            We provide the digital architecture that allows educational institutions to transcend administrative burdens and return to their primary calling: shaping the future.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center gap-2 group"
                            >
                                Learn More
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                            >
                                View Case Studies
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
                        ></motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/50"
                        >
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlkeb4TyBTRRUrQteqNk3zTlpB_8x0Ze25ANDsLpGslZuBWjp1yMZ9Xd9GOAkaY2nBt9sq4WMYIeNIOyeseZoz6Zck5dZKRs5IxbXljYVhL2tfD9VjEOFfuVB1wwORPteF_nW3yPPM7Eg-oksz_reyGxxgyjUhIrHn50YvMRbFFpPd8vcg7ouqKCyh-6iZMsqvy4cLlLqjFxXFhP4bZLh4OdoRc56Yp3F1QRFgnu51J1i3l3XyvYOGB-ZO3PQttCSPbN2pdvMikvA" 
                                alt="Modern Classroom" 
                                className="w-full h-[550px] object-cover hover:scale-105 transition-transform duration-1000"
                            />
                            
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="absolute bottom-8 left-8 right-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 dark:border-slate-700/40 shadow-2xl"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                        <span className="material-symbols-outlined text-3xl font-light">school</span>
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">Empowering 500+ Schools</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Global impact across 45 countries</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100 dark:bg-blue-900/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-30"></div>
        </section>
    );
};

export default AboutHero;
