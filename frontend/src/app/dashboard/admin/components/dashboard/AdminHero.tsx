"use client";

import { Building2, Sparkles, ShieldCheck, ChevronRight, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

interface AdminHeroProps {
    schoolName: string;
    primaryColor?: string;
}

export default function AdminHero({ schoolName, primaryColor = '#2563eb' }: AdminHeroProps) {
    return (
        <section 
            className="relative overflow-hidden rounded-[3rem] p-8 md:p-14 border-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl group transition-all"
            style={{ boxShadow: `0 25px 50px -12px ${primaryColor}20` }}
        >
            {/* Animated Background Gradients */}
            <div 
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl animate-pulse pointer-events-none opacity-20" 
                style={{ backgroundColor: primaryColor }}
            />
            <div 
                className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none opacity-20"
                style={{ backgroundColor: primaryColor }}
            />
            
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                 <Building2 size={400} style={{ color: primaryColor }} className="rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge 
                            className="text-white border-0 rounded-full px-5 py-1.5 text-[11px] font-black uppercase tracking-widest backdrop-blur-md"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
                        >
                            School Management Dashboard
                        </Badge>
                        <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                System Status: Online
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.9]">
                            Welcome to the <span style={{ color: primaryColor }}>Dashboard,</span>
                        </h1>
                        <h2 className="text-xl md:text-2xl font-black text-slate-500 dark:text-slate-400 tracking-tighter">
                            {schoolName}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/admin/settings"
                            className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-white"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}30` }}
                        >
                            Dashboard Settings <ChevronRight size={14} />
                        </Link>
                        <div className="flex items-center gap-2 text-slate-400">
                             <ShieldCheck size={18} style={{ color: primaryColor }} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Secure Session</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-5 bg-white/40 dark:bg-slate-950/40 p-4 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 backdrop-blur-md shadow-inner">
                        <div 
                            className="h-12 w-12 rounded-2xl text-white flex items-center justify-center shadow-lg transition-transform hover:rotate-3"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 20px -5px ${primaryColor}40` }}
                        >
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">System Mode</p>
                            <p className="font-black text-slate-900 dark:text-white whitespace-nowrap uppercase italic">Live Status</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

