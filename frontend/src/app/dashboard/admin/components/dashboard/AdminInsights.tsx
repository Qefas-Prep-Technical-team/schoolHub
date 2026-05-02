"use client";

import { Users, GraduationCap, Building2, BookOpen, CalendarCheck, FileText, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminInsightsProps {
    stats?: {
        students: number;
        teachers: number;
        classes: number;
        exams: number;
        subjects: number;
    };
    isLoading?: boolean;
    primaryColor?: string;
}

export default function AdminInsights({ stats, isLoading, primaryColor = '#2563eb' }: AdminInsightsProps) {
    const metrics = [
        {
            label: "Total Students",
            value: stats?.students?.toLocaleString() || "0",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            trend: "+12%"
        },
        {
            label: "Total Teachers",
            value: stats?.teachers?.toLocaleString() || "0",
            icon: GraduationCap,
            color: "text-primary",
            bg: "bg-primary/10",
            trend: "Stable",
            customColor: primaryColor
        },
        {
            label: "Total Classes",
            value: stats?.classes?.toLocaleString() || "0",
            icon: Building2,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            trend: "Active"
        },
        {
            label: "Active Courses",
            value: stats?.subjects?.toLocaleString() || "0",
            icon: BookOpen,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
            trend: "Verified"
        },
        {
            label: "School Status",
            value: "98%",
            icon: CalendarCheck,
            color: "text-rose-600",
            bg: "bg-rose-500/10",
            trend: "Good"
        },
        {
            label: "Total Exams",
            value: stats?.exams?.toLocaleString() || "0",
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
            trend: "Live"
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
                ))}
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
            {metrics.map((stat: any, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 hover:bg-white dark:hover:bg-slate-900"
                >
                    <div 
                        className={cn("absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500", !stat.customColor && stat.bg)} 
                        style={stat.customColor ? { backgroundColor: stat.customColor } : {}}
                    />
                    <div className="relative z-10 flex flex-col gap-4">
                        <div 
                            className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20 dark:border-slate-700/50", !stat.customColor && stat.bg, !stat.customColor && stat.color)}
                            style={stat.customColor ? { backgroundColor: `${stat.customColor}15`, color: stat.customColor, borderColor: `${stat.customColor}30` } : {}}
                        >
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full",
                                    stat.trend === 'Optimal' || stat.trend === 'Verified' || stat.trend.startsWith('+') 
                                        ? "bg-emerald-500/10 text-emerald-600" 
                                        : "bg-primary/10 text-primary"
                                )}>{stat.trend}</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{stat.value}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </section>
    );
}

