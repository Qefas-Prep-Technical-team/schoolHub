import { Clock, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassStatsProps {
  totalClasses: number;
}

export function ClassStats({ totalClasses }: ClassStatsProps) {
  const stats = [
    { label: 'No of Classes', value: totalClasses, icon: Layers, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Weekly Periods', value: `${totalClasses * 4}`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Attendance', value: 'N/A', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Academic Progress', value: 'N/A', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-[2rem] flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                <stat.icon size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
            </div>
        </div>
      ))}
    </section>
  );
}
