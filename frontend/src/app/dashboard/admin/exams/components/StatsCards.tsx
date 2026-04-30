'use client';

import { Exam } from "@/lib/api/services/examService";
import { Trophy, Activity, Calendar, FileEdit, Zap, TrendingUp } from "lucide-react";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    exams: Exam[];
}

export default function StatsCards({ exams = [] }: StatsCardsProps) {
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: settings } = useSchoolSettings(schoolId);
    const primaryColor = settings?.themeColor || '#ea580c';

    const now = new Date();
    
    const stats = [
        { 
            label: 'Institutional Registry', 
            value: exams.length.toString(),
            icon: Trophy,
            color: primaryColor,
            desc: 'Total Assessment Nodes'
        },
        { 
            label: 'Operational Sync', 
            value: exams.filter(e => e.status === 'PUBLISHED').length.toString(),
            icon: Activity,
            color: '#10b981', // Emerald
            desc: 'Active Protocols'
        },
        { 
            label: 'Temporal Schedule', 
            value: exams.filter(e => e.status === 'PUBLISHED' && e.startDate && new Date(e.startDate) > now).length.toString(),
            icon: Calendar,
            color: '#6366f1', // Indigo
            desc: 'Pending Deployments'
        },
        { 
            label: 'Development Hub', 
            value: exams.filter(e => e.status === 'DRAFT').length.toString(),
            icon: FileEdit,
            color: '#f59e0b', // Amber
            desc: 'Draft Architectures'
        },
    ];

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="relative group overflow-hidden rounded-[3rem] p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-all duration-500"
                >
                    {/* Ambient Background Glow */}
                    <div 
                        className="absolute -right-6 -bottom-6 size-40 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" 
                        style={{ backgroundColor: stat.color }}
                    />

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div 
                                className="size-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110"
                                style={{ 
                                    backgroundColor: `${stat.color}10`,
                                    borderColor: `${stat.color}20`,
                                    color: stat.color
                                }}
                            >
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <TrendingUp size={10} /> Live
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                {stat.label}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                                    {stat.value}
                                </h3>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 mt-4 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} className="text-slate-300" /> {stat.desc}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
