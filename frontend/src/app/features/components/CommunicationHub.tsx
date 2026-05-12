"use client"
import React from 'react';
import NextImage from 'next/image';
import { motion } from 'framer-motion';

const CommunicationHub: React.FC = () => {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative">
                            <NextImage 
                                className="w-full h-full object-cover" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlouDyM4VUCHVIFqomHEaIqGIR0py8NXH9HVYWIXwy2iy8afI-cY16Rm-YoR0-KYW5Ic8f8whqYXdzYnbYHOqGCh7ynaJp92BRlJ-kP8l97PhLJThayPGb3SMldQpyegTyv_BKYM1lCsa8dzKrvIjIRLDTm6REE6R1xd0De7sr2Q3GwvwI7kFBGwAilQnTy1l9BcF2wGqcgZoR63rvezoSIN_eAZU8j86lOccYwhvw9hnOrMFZgnySewU6IzItoNzIWLQRy1Tt-7k" 
                                alt="Teachers and parents collaborating"
                                width={600}
                                height={600}
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                        </div>
                        
                        {/* UI Element Mockup */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="absolute top-1/2 -right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-sm hidden md:block border border-white/20"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">New Message</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">From Mr. Anderson (Math Dept)</p>
                                </div>
                            </div>
                            <div className="relative">
                                <p className="text-sm italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium leading-relaxed">
                                    &quot;Hi Sarah, Leo has shown great progress in algebra this week! Check the new materials.&quot;
                                </p>
                                <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-50 dark:bg-slate-800/50 border-l border-t border-slate-100 dark:border-slate-700 rotate-[-45deg]"></div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="space-y-10">
                        <div>
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight"
                            >
                                Communication <br />
                                <span className="text-blue-600">Hub</span>
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium"
                            >
                                Bridge the gap between home and school with a centralized platform for secure, real-time engagement.
                            </motion.p>
                        </div>

                        <div className="space-y-8">
                            {[
                                {
                                    icon: "message",
                                    title: "Seamless Parent-Teacher Messaging",
                                    description: "Encrypted direct messaging that keeps conversations professional, archived, and easy to manage.",
                                    color: "bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                },
                                {
                                    icon: "campaign",
                                    title: "School-wide Announcements",
                                    description: "Broadcast urgent alerts, event reminders, and newsletters via push, email, and SMS simultaneously.",
                                    color: "bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex gap-6 group"
                                >
                                    <div className={`shrink-0 w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-2">{item.title}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CommunicationHub;
