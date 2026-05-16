"use client";
import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Sparkles, BarChart2, CalendarCheck, Users, GraduationCap,
  ShieldCheck, Bell, BookOpen, TrendingUp
} from 'lucide-react';

// ─── dashdesign01 "Lumina Finance" — Features Bento Grid ─────────────────────
// Light: #fcf8ff / #EEF2FF base, white cards, dark navy headings
// Dark:  #0f1929 / #111827 base, #1e293b cards, white headings
// ─────────────────────────────────────────────────────────────────────────────

interface Feature {
    title: string;
    description: string;
    image: string;
}

const featureIcons = [BarChart2, CalendarCheck, Users, GraduationCap, ShieldCheck, Bell, BookOpen, TrendingUp];

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

    const bentoStyles = [
        "md:col-span-2 md:row-span-2",
        "md:col-span-2 md:row-span-1",
        "md:col-span-1 md:row-span-1",
        "md:col-span-1 md:row-span-1",
    ];

    return (
        <section className="py-24 px-6 overflow-hidden bg-white dark:bg-[#0a0f1e]">
            <div className="max-w-[1280px] mx-auto">

                {/* ── Section header ─────────────────────────────────── */}
                <div className="text-center mb-16 relative">
                    {/* Subtle glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/8 dark:bg-blue-500/15 rounded-full blur-[80px] -z-10 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 border border-blue-100 dark:border-blue-800/40"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Capabilities
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1] text-[#1a1a2b] dark:text-white"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        A Unified Platform for{' '}
                        <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                            Modern Institutions
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-[#45464c] dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Every tool your institution needs, seamlessly integrated and
                        designed for exceptional performance and speed.
                    </motion.p>
                </div>

                {/* ── Bento grid ─────────────────────────────────────── */}
                <div className="bento-grid">
                    {features.slice(0, 4).map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                // dashdesign01: white card / dark surface with ambient shadow
                                "relative group overflow-hidden rounded-[2rem]",
                                "border border-slate-200/60 dark:border-white/[0.06]",
                                "bg-white/60 dark:bg-[#111827]/80 backdrop-blur-xl",
                                "shadow-[0_4px_20px_rgba(10,10,26,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]",
                                "hover:shadow-[0_12px_40px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_12px_40px_rgba(37,99,235,0.20)]",
                                "hover:border-blue-400/30 dark:hover:border-blue-500/30",
                                "transition-all duration-500",
                                bentoStyles[index]
                            )}
                        >
                            {/* Hover glow overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-[2rem]" />

                            {/* Background image */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                {/* Gradient: bottom fade — darker in dark mode */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent z-10" />
                            </div>

                            {/* Text content */}
                            <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-10">
                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight group-hover:text-blue-100 transition-colors"
                                >
                                    {feature.title}
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="text-slate-300 dark:text-slate-400 font-light leading-relaxed max-w-md group-hover:text-slate-200 transition-colors text-sm md:text-base"
                                >
                                    {feature.description}
                                </motion.p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Additional feature cards ────────────────────────── */}
                {features.slice(4).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {features.slice(4).map((feature, index) => {
                            const Icon = featureIcons[index + 4] ?? Sparkles;
                            return (
                                <motion.div
                                    key={index + 4}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "p-7 rounded-2xl group cursor-default",
                                        "border border-slate-200/60 dark:border-white/[0.06]",
                                        "bg-white dark:bg-[#111827]/60 backdrop-blur-md",
                                        "shadow-[0_4px_20px_rgba(10,10,26,0.06)] dark:shadow-none",
                                        "hover:shadow-[0_8px_32px_rgba(37,99,235,0.10)] dark:hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)]",
                                        "hover:-translate-y-1 hover:border-blue-400/30 dark:hover:border-blue-500/30",
                                        "transition-all duration-300"
                                    )}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-base font-bold text-[#1a1a2b] dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {feature.title}
                                    </h4>
                                    <p className="text-[#45464c] dark:text-slate-400 font-light text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Features;
