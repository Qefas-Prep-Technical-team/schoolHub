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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
      <StatCard 
        label="Average Grade"
        value={`${stats.averageGrade}%`}
        subValue="+5% from last month"
        icon={Award}
        color="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <StatCard 
        label="Assignments"
        value={stats.assignmentsCompleted}
        subValue="Completed this term"
        icon={ClipboardList}
        color="text-blue-500"
        bgColor="bg-blue-500/10"
      />
      <StatCard 
        label="Quizzes"
        value={stats.quizzesCompleted}
        subValue="Completed this term"
        icon={PenTool}
        color="text-purple-500"
        bgColor="bg-purple-500/10"
      />
      <StatCard 
        label="Upcoming"
        value={stats.upcomingDeadlines}
        subValue="Active deadlines"
        icon={Calendar}
        color="text-amber-500"
        bgColor="bg-amber-500/10"
      />
      <StatCard 
        label="Participation"
        value={`${stats.participationRate}%`}
        subValue="Engagement score"
        icon={ShieldCheck}
        color="text-primary"
        bgColor="bg-primary/10"
      />
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color, bgColor }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                    <span className={`text-2xl font-black text-slate-900 dark:text-white`}>
                        {value}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <TrendingUp size={12} className={subValue.includes('+') ? 'text-emerald-500' : 'text-slate-400'} />
                {subValue}
            </div>
        </motion.div>
    );
}