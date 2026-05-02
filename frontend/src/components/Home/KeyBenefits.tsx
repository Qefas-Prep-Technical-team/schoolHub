"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, ArrowRight, History, Landmark, Droplets, Eye, TrendingUp } from 'lucide-react';

const KeyBenefits = () => {
    return (
        <section className="py-32 px-6 max-w-7xl mx-auto relative">
            {/* Abstract Background Gradients */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Institutional Partners / Social Proof */}
            <div className="mb-32">
                <p className="text-center text-xs font-bold text-slate-400 mb-16 uppercase tracking-[0.3em]">Institutional Partners</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-24 opacity-50 hover:opacity-100 transition-opacity duration-700 px-4">
                    <div className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight grayscale group hover:grayscale-0 transition-all">
                        <History className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> ACADEMY
                    </div>
                    <div className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight grayscale group hover:grayscale-0 transition-all">
                        <Landmark className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> POLYTECH
                    </div>
                    <div className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight grayscale group hover:grayscale-0 transition-all">
                        <Droplets className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> EDUFLOW
                    </div>
                    <div className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight grayscale group hover:grayscale-0 transition-all">
                        <Eye className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> LENSCO
                    </div>
                    <div className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight grayscale group hover:grayscale-0 transition-all">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> STRIVE
                    </div>
                </div>
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
                <div className="lg:col-span-1">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-[1.15] font-lexend"
                    >
                        Everything you need to <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent italic">excel.</span>
                    </motion.h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        We've built a holistic ecosystem that addresses the intricate challenges of modern education, from classroom dynamics to complex administration.
                    </p>
                    <div className="mt-8">
                        <a className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:gap-4 transition-all group cursor-pointer inline-flex">
                            Explore all features <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 group"
                    >
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 font-lexend tracking-tight">Curriculum Control</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                            Centralize lesson planning, digital resources, and adaptive syllabus tracking in a unified workspace.
                        </p>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20 transition-all duration-300 group"
                    >
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 font-lexend tracking-tight">Student Success</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                            Advanced behavior analytics and academic performance tracking with personalized interventions.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default KeyBenefits;
