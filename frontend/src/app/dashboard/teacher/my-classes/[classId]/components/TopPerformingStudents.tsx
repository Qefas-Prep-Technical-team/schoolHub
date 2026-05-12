import { Trophy, TrendingUp, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Student {
  id: string;
  name: string;
  rank: number;
  score: number;
  avatar: string;
  improvement: string;
}

interface TopPerformingStudentsProps {
  students: Student[];
  onViewAll: () => void;
}

export default function TopPerformingStudents({ students, onViewAll }: TopPerformingStudentsProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 2:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 3:
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Award className="text-amber-500" size={24} />
          Student Honors
        </h2>
        <button
          onClick={onViewAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all"
        >
          Leaderboard
        </button>
      </div>

      <div className="space-y-4">
        {students.map((student, idx) => (
          <motion.div
            key={student.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                    <Image
                        src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'}
                        alt={student.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white dark:border-slate-800 ${getRankStyle(student.rank)}`}>
                  {student.rank}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {student.name}
                  </p>
                  <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-lg border uppercase tracking-tighter ${
                    student.improvement.startsWith('+')
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}>
                    <TrendingUp size={10} />
                    {student.improvement}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Star size={12} className={student.rank <= 3 ? 'text-amber-500' : 'text-slate-300'} fill={student.rank <= 3 ? 'currentColor' : 'none'} />
                  Elite Performer
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-xl font-black ${
                student.score >= 90 ? 'text-emerald-500' :
                student.score >= 80 ? 'text-primary' :
                'text-amber-500'
              }`}>
                {student.score}%
              </p>
              <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                Avg. GPA
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Trophy className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Historical Performance Pending</p>
        </div>
      )}
    </div>
  );
}