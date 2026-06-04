"use client"
import React, { FC } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useFetchWhatUsersSay } from './query';

const UsersSay: FC = () => {
    const { data } = useFetchWhatUsersSay();

    return (
        <section className="py-32 bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0f1e] dark:to-[#0f1929] rounded-[3rem] my-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-16 gap-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-[0.15em]">
                        Real Stories
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black leading-tight font-lexend tracking-tight max-w-2xl" style={{ letterSpacing: '-0.02em' }}>
                        Schools across Nigeria trust{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Qefas Hub</span>
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-xl">
                        Here&apos;s what administrators and educators say after switching to the platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {data && data.map((user, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col h-full bg-white dark:bg-[#111827]/80 rounded-3xl p-8 border border-slate-100 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(10,10,26,0.06)] dark:shadow-none hover:shadow-[0_8px_32px_rgba(37,99,235,0.10)] dark:hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="flex gap-1 text-amber-400 mb-5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <blockquote className="text-base font-light text-slate-700 dark:text-slate-300 mb-8 flex-grow leading-relaxed">
                                &ldquo;{user.comment}&rdquo;
                            </blockquote>
                            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/[0.06] pt-6 mt-auto">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-100 dark:ring-white/10 shrink-0">
                                    <Image 
                                        src={user.image} 
                                        alt={user.name} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UsersSay;
