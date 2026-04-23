"use client"
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bolt, CheckCircle2, Apple, PlayCircle, Bell, Calendar, MessageSquare, Settings, ClipboardList, CalendarCheck } from 'lucide-react';

const MobileExperience = () => {
    return (
        <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                
                {/* iPhone Showcase Area */}
                <div className="order-2 lg:order-1 flex justify-center relative">
                    {/* Glowing Aura */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/20 rounded-full blur-[120px]" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="iphone-frame scale-90 md:scale-100"
                    >
                        <div className="iphone-notch" />
                        <div className="w-full h-full bg-slate-50 p-5 pt-12 overflow-hidden flex flex-col">
                            {/* App UI Mockup */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Good morning,</p>
                                    <p className="text-xl font-black text-slate-900 font-lexend">Prof. Anderson</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="space-y-5 flex-1">
                                <div className="bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
                                    <p className="text-[10px] font-bold text-blue-100 uppercase mb-2">Next Class</p>
                                    <p className="font-black text-lg">Advanced Physics</p>
                                    <p className="text-xs text-blue-100/80">Room 402 • 10:30 AM</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl text-center shadow-sm border border-slate-200">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            <CalendarCheck className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-900">Attendance</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl text-center shadow-sm border border-slate-200">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            <ClipboardList className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-900">Grading</p>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Recent Messages</p>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-3/4 bg-slate-200 rounded animate-pulse" />
                                                <div className="h-2 w-1/2 bg-slate-100 rounded animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
                                                <div className="h-2 w-2/3 bg-slate-100 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Bar */}
                            <div className="mt-4 h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-around border border-slate-200">
                                <Bell className="w-5 h-5 text-blue-600" />
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                                <Settings className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Text Content Area */}
                <div className="lg:pl-10">
                    <motion.h2 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight font-lexend"
                    >
                        Your campus, <br />
                        <span className="text-blue-500">in your pocket.</span>
                    </motion.h2>
                    <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                        Experience seamless management on the go. Qefas Hub keeps administrators, teachers, and parents connected with real-time updates and native performance.
                    </p>
                    
                    <ul className="space-y-8 mb-12">
                        <li className="flex items-start gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                                <Bolt className="w-6 h-6 text-blue-500 group-hover:text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-lg mb-1">Instant Notifications</p>
                                <p className="text-slate-400 text-sm leading-relaxed">Real-time alerts for critical events, grade updates, and institutional messages.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                                <CheckCircle2 className="w-6 h-6 text-blue-500 group-hover:text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-lg mb-1">Offline Sync</p>
                                <p className="text-slate-400 text-sm leading-relaxed">Continue managing tasks and viewing resources even without an internet connection.</p>
                            </div>
                        </li>
                    </ul>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all group">
                            <Apple className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Download on the</p>
                                <p className="text-sm font-black">App Store</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all group">
                            <PlayCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Get it on</p>
                                <p className="text-sm font-black">Google Play</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MobileExperience;
