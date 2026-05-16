"use client";

import { Award, TrendingUp, Sparkles, Activity, ShieldCheck, BarChart3, Gem } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DonutChart from "./DonutChart";
import { useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface SchoolPerformanceProps {
    analysis?: {
        averageScore: number;
        totalAssessments: number;
        subjectBreakdown?: { name: string; average: number }[];
        insight?: string;
        isPremium?: boolean;
    };
    isLoading?: boolean;
    primaryColor?: string;
}

export default function SchoolPerformance({ analysis, isLoading, primaryColor = '#2563eb' }: SchoolPerformanceProps) {
    const hasData = (analysis?.totalAssessments || 0) > 0;
    const isPremiumRestricted = analysis?.isPremium === true;

    const chartData = useMemo(() => {
        if (!analysis || !analysis.subjectBreakdown) return [
            { name: 'High Performers', value: 0, color: primaryColor },
            { name: 'Average', value: 0, color: '#3b82f6' },
            { name: 'Review', value: 0, color: '#f43f5e' },
        ];

        const excellentCount = analysis.subjectBreakdown.filter(s => s.average >= 75).length;
        const goodCount = analysis.subjectBreakdown.filter(s => s.average >= 50 && s.average < 75).length;
        const atRiskCount = analysis.subjectBreakdown.filter(s => s.average < 50).length;
        const total = excellentCount + goodCount + atRiskCount || 1;

        return [
            { name: 'High Performers', value: Math.round((excellentCount / total) * 100), color: primaryColor },
            { name: 'Average', value: Math.round((goodCount / total) * 100), color: '#3b82f6' },
            { name: 'Review', value: Math.round((atRiskCount / total) * 100), color: '#f43f5e' },
        ];
    }, [analysis, primaryColor]);

    return (
        <section className="bg-white/70 dark:bg-slate-900/80 border border-white/50 dark:border-slate-800/50 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl shadow-xl overflow-hidden relative group">
            {/* Ambient glow */}
            <div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 -translate-y-20 translate-x-20 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />

            <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                        <div 
                            className="h-12 w-12 rounded-2xl text-white flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 20px -5px ${primaryColor}40` }}
                        >
                            <Sparkles size={24} className="animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">School <span style={{ color: primaryColor }}>Performance</span></h2>
                    </div>
 
                    <div className="space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 shadow-inner italic relative overflow-hidden group/insight">
                            <div className="absolute left-0 top-0 w-1.5 h-full" style={{ backgroundColor: primaryColor }} />
                            <div className="flex flex-col gap-2 relative z-10">
                                <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-sm">
                                    "{analysis?.insight || "Analyzing school performance data to provide helpful insights..."}"
                                </p>
                                {isPremiumRestricted && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Gem size={14} className="text-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Premium feature</span>
                                    </div>
                                )}
                            </div>
                        </div>
 
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2rem] bg-slate-500/5 dark:bg-slate-500/10 border border-slate-500/10 shadow-sm transition-colors hover:bg-slate-500/15" style={{ borderColor: `${primaryColor}20` }}>
                                <div className="flex items-center gap-2 mb-2" style={{ color: primaryColor }}>
                                    <Activity size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">School Average</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">
                                    {hasData ? `${analysis?.averageScore}%` : "N/A"} 
                                    {hasData && <span className="text-xs text-slate-400 font-bold ml-1">AVG</span>}
                                </p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 shadow-sm transition-colors hover:bg-blue-500/10">
                                <div className="flex items-center gap-2 text-blue-500 mb-2">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Status</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">Normal</p>
                            </div>
                        </div>
                    </div>
                </div>
 
                <div className="w-full xl:w-80 h-80 shrink-0 relative p-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center">
                    <div 
                        className="absolute inset-0 rounded-full blur-3xl scale-125 pointer-events-none opacity-20" 
                        style={{ backgroundColor: primaryColor }}
                    />
                    {isLoading ? (
                        <div className="h-48 w-48 rounded-full border-4 border-dashed border-slate-100 dark:border-slate-800 animate-pulse" />
                    ) : (
                        <DonutChart 
                            data={chartData}
                            innerRadius={75}
                            outerRadius={100}
                            centerLabel={{
                                title: 'Avg Grade',
                                value: hasData ? (analysis!.averageScore >= 75 ? 'A+' : analysis!.averageScore >= 60 ? 'B' : 'C') : 'N/A'
                            }}
                        />
                    )}
                </div>
            </div>
 
            {/* Sub-metrics Summary */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                     <div className="flex -space-x-3">
                        {chartData.map((item, i) => (
                            <div key={i} className="h-10 w-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg" style={{ backgroundColor: item.color }}>
                                {item.value}%
                            </div>
                        ))}
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Performance Distribution</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-5 py-2 rounded-full shadow-2xl">
                    <BarChart3 style={{ color: primaryColor }} size={16} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{analysis?.totalAssessments || 0} Total Records Found</span>
                </div>
            </div>
        </section>
    );
}

