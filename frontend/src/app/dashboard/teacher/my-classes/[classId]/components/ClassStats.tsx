import { Award, ClipboardList, PenTool, Calendar, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassStatsProps {
  stats: {
    averageGrade: number;
    assignmentsCompleted: number;
    quizzesCompleted: number;
    upcomingDeadlines: number;
    participationRate: number;
  };
}

export default function ClassStats({ stats }: ClassStatsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/70 dark:bg-emerald-950/40 backdrop-blur-3xl border border-slate-200/60 dark:border-emerald-800/50 rounded-[3rem] shadow-2xl overflow-hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-200/50 dark:divide-slate-800/50">
        <StatBlock 
          label="Class Average"
          value={`${stats.averageGrade}%`}
          trend="Overall Average"
          icon={Award}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          borderGlow="group-hover:border-emerald-500/50"
          shadowGlow="group-hover:shadow-emerald-500/20"
        />
        <StatBlock 
          label="Assignments"
          value={stats.assignmentsCompleted}
          trend="Total Graded"
          icon={ClipboardList}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          borderGlow="group-hover:border-blue-500/50"
          shadowGlow="group-hover:shadow-blue-500/20"
        />
        <StatBlock 
          label="Quizzes"
          value={stats.quizzesCompleted}
          trend="Total Completed"
          icon={PenTool}
          color="text-purple-500"
          bg="bg-purple-500/10"
          borderGlow="group-hover:border-purple-500/50"
          shadowGlow="group-hover:shadow-purple-500/20"
        />
        <StatBlock 
          label="Deadlines"
          value={stats.upcomingDeadlines}
          trend="Upcoming"
          icon={Calendar}
          color="text-amber-500"
          bg="bg-amber-500/10"
          borderGlow="group-hover:border-amber-500/50"
          shadowGlow="group-hover:shadow-amber-500/20"
        />
        <StatBlock 
          label="Engagement"
          value={`${stats.participationRate}%`}
          trend="Attendance"
          icon={ShieldCheck}
          color="text-emerald-600"
          bg="bg-emerald-600/10"
          borderGlow="group-hover:border-emerald-600/50"
          shadowGlow="group-hover:shadow-emerald-600/20"
        />
      </div>
    </motion.div>
  );
}

function StatBlock({ label, value, trend, icon: Icon, color, bg, borderGlow, shadowGlow }: any) {
    return (
        <div className={`relative p-8 md:p-10 flex flex-col justify-between transition-all duration-500 group bg-transparent hover:bg-white dark:hover:bg-slate-800/80`}>
            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 border-2 border-transparent transition-colors duration-500 ${borderGlow} pointer-events-none rounded-[3rem] z-10 m-[-2px]`}></div>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_80px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] ${shadowGlow} pointer-events-none rounded-[3rem]`}></div>
            
            <div className="relative z-20 flex items-center justify-between mb-8">
                <div className={`p-4 rounded-[1.25rem] ${bg} ${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40/50 text-slate-400 group-hover:bg-transparent group-hover:text-slate-500 transition-colors">
                    {trend}
                </span>
            </div>
            <div className="relative z-20">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 group-hover:text-slate-500 transition-colors">{label}</h4>
                <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm group-hover:scale-105 origin-left transition-transform duration-500">
                    {value}
                </div>
            </div>
        </div>
    );
}