"use client"
import React, { FC } from 'react';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useFetchWhatUsersSay } from './query';

const UsersSay: FC = () => {
    const { data, isLoading } = useFetchWhatUsersSay();

    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] my-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-amber-600 font-bold tracking-widest text-sm uppercase mb-4 block">Endorsements</span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight font-lexend">
                            Trusted by global leaders in education.
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {data && data.map((user, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col h-full group"
                        >
                            <div className="flex gap-1 text-amber-500 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            <blockquote className="text-xl font-light italic text-slate-700 dark:text-slate-300 mb-8 flex-grow leading-relaxed">
                                "{user.comment}"
                            </blockquote>
                            <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-8 mt-auto">
                                <div className="relative w-14 h-14 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <Image 
                                        src={user.image} 
                                        alt={user.name} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white font-lexend">{user.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
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
