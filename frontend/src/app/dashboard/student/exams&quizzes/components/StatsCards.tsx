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

export default function StatsCards({ cards }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => {
                const Icon = iconMap[card.icon] || Info;

                return (
                    <Link 
                        key={card.label} 
                        href={`/dashboard/student/exams&quizzes/${card.link}`}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/40 dark:backdrop-blur-xl"
                    >
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-primary">
                                       <Icon size={18} />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider">{card.label}</p>
                                </div>
                                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>

                            <div className="flex items-end gap-3 mt-1">
                                <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {card.value}
                                </p>
                                {card.trend && (
                                    <div className={`flex items-center gap-0.5 mb-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                        card.trend.color === 'green'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                    }`}>
                                        {card.trend.color === 'green' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {card.trend.value}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                    </Link>
                );
            })}
        </div>
    );
}