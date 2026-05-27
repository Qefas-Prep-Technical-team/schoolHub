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
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800/50">
        <StatBlock 
          label="Class Average"
          value={`${stats.averageGrade}%`}
          trend="+5%"
          icon={Award}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatBlock 
          label="Assignments"
          value={stats.assignmentsCompleted}
          trend="+12 this term"
          icon={ClipboardList}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatBlock 
          label="Quizzes"
          value={stats.quizzesCompleted}
          trend="+3 this term"
          icon={PenTool}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
        <StatBlock 
          label="Deadlines"
          value={stats.upcomingDeadlines}
          trend="Urgent"
          icon={Calendar}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatBlock 
          label="Engagement"
          value={`${stats.participationRate}%`}
          trend="High"
          icon={ShieldCheck}
          color="text-primary"
          bg="bg-primary/10"
        />
      </div>
    </motion.div>
  );
}

function StatBlock({ label, value, trend, icon: Icon, color, bg }: any) {
    return (
        <div className="p-6 md:p-8 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h4>
                <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {value}
                </div>
            </div>
        </div>
    );
}