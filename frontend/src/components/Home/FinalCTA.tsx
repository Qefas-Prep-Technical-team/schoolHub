"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuthModalStore } from '@/utils/AuthModalStore';

const FinalCTA = () => {
    useAuthModalStore();
    return (
        <section className="py-40 px-6">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto rounded-[3.5rem] bg-slate-950 text-white p-12 md:p-24 relative overflow-hidden text-center shadow-2xl border border-white/10"
            >
                {/* Vibrant Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-950 to-indigo-900/40 z-0" />
                
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/2 -right-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/40 rounded-full blur-[80px] sm:blur-[100px] mix-blend-screen pointer-events-none" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-1/2 -left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-amber-500/30 rounded-full blur-[80px] sm:blur-[100px] mix-blend-screen pointer-events-none" 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-indigo-500/10 rounded-full blur-[100px] sm:blur-[120px] mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 rounded-full text-xs font-bold uppercase tracking-widest mb-8 shadow-xl"
                    >
                        <Sparkles className="w-4 h-4 text-blue-400" /> Start Your Journey
                    </motion.div>

                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-8 leading-[1.2] sm:leading-[1.1] tracking-tight font-lexend text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-indigo-200 px-4">
                        Ready to lead the future of education?
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100/70 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
                        Join hundreds of institutions worldwide and transform your management experience today with Qefas Hub.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button className="px-12 py-8 bg-white text-slate-900 font-bold rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-300 text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.6)] w-full sm:w-auto">
                                Get Started Now
                            </Button>
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button variant="outline" className="px-12 py-8 bg-white/5 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300 text-lg w-full sm:w-auto flex items-center justify-center gap-2 group shadow-xl">
                                Contact Sales <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    
                    <p className="mt-12 text-[11px] text-blue-200/50 tracking-[0.3em] uppercase font-bold">
                        No credit card required • 14-day free trial
                    </p>
                </div>
            </motion.div>
        </section>
    );
};

export default FinalCTA;
