"use client";
import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    image: string;
}

const Features: FC = () => {
    const [features, setFeatures] = useState<Feature[]>([]);

    useEffect(() => {
        const fetchFeatures = async () => {
            const res = await fetch('/json/Features.json');
            const data = await res.json();
            setFeatures(data);
        }
        fetchFeatures()
    }, []);

    // We'll use a hardcoded layout for the Bento Grid but populate with data
    const bentoStyles = [
        "md:col-span-2 md:row-span-2", // Large item
        "md:col-span-2 md:row-span-1", // Horizontal item
        "md:col-span-1 md:row-span-1", // Square item
        "md:col-span-1 md:row-span-1", // Square item
    ];

    return (
        <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
            <div className="text-center mb-24 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[80px] -z-10" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 border border-blue-100/50 dark:border-blue-800/50 backdrop-blur-md"
                >
                    <Sparkles className="w-4 h-4" /> Capabilities
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-8 font-lexend tracking-tight leading-[1.15]"
                >
                    A Unified Platform for <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                        Modern Institutions
                    </span>
                </motion.h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
                    Every tool your institution needs, seamlessly integrated and designed for exceptional performance and speed.
                </p>
            </div>

            <div className="bento-grid">
                {features.slice(0, 4).map((feature, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "relative group overflow-hidden rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl shadow-blue-900/5 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-500",
                            bentoStyles[index]
                        )}
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                        <div className="absolute inset-0 z-0">
                            <Image
                                src={feature.image}
                                alt={feature.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />
                        </div>
                        
                        <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-12">
                            <motion.h3 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="text-2xl md:text-3xl font-black text-white mb-4 font-lexend tracking-tight group-hover:text-blue-100 transition-colors"
                            >
                                {feature.title}
                            </motion.h3>
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="text-slate-300 font-light leading-relaxed max-w-md group-hover:text-slate-200 transition-colors"
                            >
                                {feature.description}
                            </motion.p>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {/* Additional Features List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative z-10">
                {features.slice(4).map((feature, index) => (
                    <motion.div 
                        key={index + 4}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-[2rem] border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-500/20 transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:text-white">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-lexend tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Features;