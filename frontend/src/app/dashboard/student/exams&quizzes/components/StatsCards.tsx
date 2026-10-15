'use client';

import React from "react";
import { StatCard } from "./types";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowUpRight, Calendar, CheckCircle, BarChart, Trophy, Info } from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";

interface StatsCardsProps {
    cards: StatCard[];
}

// Map pseudo-material icon names to Lucide icons
const iconMap: Record<string, React.ElementType> = {
    'event_upcoming': Calendar,
    'task_alt': CheckCircle,
    'monitoring': BarChart,
    'emoji_events': Trophy,
};

const tooltips: Record<string, string> = {
    'Upcoming': 'Scheduled exams, continuous assessments, and quizzes approaching their activation window.',
    'Completed': 'Total completed examination papers, graded quizzes, and submitted coursework assignments.',
    'Average Score': 'Cumulative percentage average achieved across all evaluated examinations and assessments.',
    'Class Position': 'Your verified class standing rank calculated across peer scholars in your active cohort.',
};

const colors = [
    { top: "bg-pink-600", text: "text-pink-600", ring: "ring-pink-600/20" },
    { top: "bg-fuchsia-600", text: "text-fuchsia-600", ring: "ring-fuchsia-600/20" },
    { top: "bg-emerald-600", text: "text-emerald-600", ring: "ring-emerald-600/20" },
    { top: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500/20" },
];

export default function StatsCards({ cards }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {cards.map((card, index) => {
                const Icon = iconMap[card.icon] || Info;
                const theme = colors[index % colors.length];
                const tooltipText = tooltips[card.label] || 'Academic assessment metric.';

                return (
                    <Link 
                        key={card.label} 
                        href={`/dashboard/student/exams&quizzes/${card.link}`}
                        className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300 dark:bg-zinc-950/80 dark:border-zinc-800"
                    >
                        {/* Colored Top Header */}
                        <div className={`${theme.top} p-3 sm:p-4 text-white flex items-center justify-between`}>
                            <p className="text-xs sm:text-sm font-bold tracking-tight truncate pr-1">{card.label}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-90" />
                                <HeaderTooltip content={tooltipText} className="text-white/80 hover:text-white" />
                            </div>
                        </div>
                        
                        {/* Bottom Content */}
                        <div className="p-3.5 sm:p-5 flex items-center justify-between relative bg-white dark:bg-zinc-950/80 flex-1">
                            <div>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {card.value}
                                </p>
                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
                                    Overall
                                </p>
                            </div>
                            
                            {/* Visual Indicator (Trend or Arrow) */}
                            {card.trend ? (
                                <div className="flex flex-col items-end shrink-0">
                                    <span className={`flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-bold ${card.trend.color === 'green' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {card.trend.color === 'green' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                        {card.trend.value}
                                    </span>
                                </div>
                            ) : (
                                <div className={`size-8 sm:size-10 rounded-full border-2 border-slate-100 dark:border-zinc-800 ${theme.text} flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform`}>
                                    <ArrowUpRight size={14} />
                                </div>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
