"use client"
import React, { FC } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PlayCircle, Verified, Star } from 'lucide-react';

const IntroSection: FC = () => {

    return (
        <section className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Image with Deep Gradient Overlay */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url('/image/backgroundSchool.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.4
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
                
                {/* Animated Glowing Orbs */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -right-1/4 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-blue-600/30 rounded-full blur-[80px] sm:blur-[120px] mix-blend-screen pointer-events-none"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 -left-1/4 w-[250px] sm:w-[600px] h-[250px] sm:h-[600px] bg-amber-500/20 rounded-full blur-[60px] sm:blur-[100px] mix-blend-screen pointer-events-none"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-blue-200 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-10 shadow-2xl shadow-blue-900/20"
                >
                    <Verified className="w-4 h-4 text-blue-400" /> 
                    <span>The Gold Standard in EdTech</span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.2] sm:leading-[1.1] font-lexend drop-shadow-2xl px-4"
                >
                    Education management, <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-200 bg-clip-text text-transparent filter drop-shadow-lg">
                        reimagined.
                    </span>
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl font-light"
                >
                    One unified platform to power your entire institution. <br className="hidden md:block" />
                    Streamline every workflow from admissions to graduation with <strong className="text-white font-semibold">Qefas Hub.</strong>
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto"
                >
                    <Link href="/signup" className="w-full sm:w-auto">
                        <Button className="px-12 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] hover:-translate-y-1 transition-all w-full sm:w-auto border border-blue-400/20">
                            Start Your Journey
                        </Button>
                    </Link>
                    <Link href="/contact" className="w-full sm:w-auto">
                        <Button variant="outline" className="px-12 py-8 bg-white/5 hover:bg-white/10 text-white text-lg font-bold rounded-2xl border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-3 w-full sm:w-auto shadow-xl group">
                            <PlayCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" /> 
                            <span>Request a Demo</span>
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating Social Proof Mini-card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-16 md:mt-24 inline-flex items-center gap-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 pr-6 shadow-2xl"
                >
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                <NextImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" width={40} height={40} className="w-full h-full rounded-full" />
                            </div>
                        ))}
                    </div>
                    <div className="text-left">
                        <div className="flex text-amber-400 mb-1">
                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="text-xs text-slate-300 font-medium">Trusted by 500+ institutions</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default IntroSection;
