import { StatCard } from "./types";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowUpRight, Calendar, CheckCircle, BarChart, Trophy, Info } from "lucide-react";

interface StatsCardsProps {
    cards: StatCard[];
}

// Map pseudo-material icon names to Lucide icons
const iconMap: Record<string, any> = {
    'event_upcoming': Calendar,
    'task_alt': CheckCircle,
    'monitoring': BarChart,
    'emoji_events': Trophy,
};

const colors = [
    { top: "bg-blue-500", text: "text-blue-500", ring: "ring-blue-500/20" },
    { top: "bg-indigo-500", text: "text-indigo-500", ring: "ring-indigo-500/20" },
    { top: "bg-emerald-500", text: "text-emerald-500", ring: "ring-emerald-500/20" },
    { top: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500/20" },
];

export default function StatsCards({ cards }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = iconMap[card.icon] || Info;
                const theme = colors[index % colors.length];

                return (
                    <Link 
                        key={card.label} 
                        href={`/dashboard/student/exams&quizzes/${card.link}`}
                        className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800"
                    >
                        {/* Colored Top Header */}
                        <div className={`${theme.top} p-4 text-white flex items-center justify-between`}>
                            <p className="text-sm font-bold tracking-wide">{card.label}</p>
                            <Icon size={18} className="opacity-80" />
                        </div>
                        
                        {/* White Bottom Content */}
                        <div className="p-6 flex items-center justify-between relative bg-white dark:bg-slate-900">
                            <div>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {card.value}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Overall
                                </p>
                            </div>
                            
                            {/* Visual Indicator (Trend or Ring) */}
                            {card.trend ? (
                                <div className={`flex flex-col items-end`}>
                                    <span className={`flex items-center gap-1 text-xs font-bold ${card.trend.color === 'green' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {card.trend.color === 'green' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {card.trend.value}
                                    </span>
                                </div>
                            ) : (
                                <div className={`size-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-transparent ${theme.text} flex items-center justify-center font-black text-xs ring-4 ring-inset ${theme.ring}`}>
                                    <ArrowUpRight size={16} />
                                </div>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
