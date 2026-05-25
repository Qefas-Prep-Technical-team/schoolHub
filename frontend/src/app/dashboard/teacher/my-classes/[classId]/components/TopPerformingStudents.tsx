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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Award className="text-primary" size={20} />
          Top Performers
        </h2>
        <button
          onClick={onViewAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-all"
        >
          Leaderboard
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {students.map((student, idx) => (
          <motion.div
            key={student.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-105">
                    <Image
                        src={student.avatar || `/users/user ${(idx % 6) + 1}.jpeg`}
                        alt={student.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shadow-md border-2 border-white dark:border-slate-900 ${getRankStyle(student.rank)}`}>
                  {student.rank}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                  {student.name}
                </p>
                <div className="flex items-center gap-1.5">
                    <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      student.improvement.startsWith('+')
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      <TrendingUp size={10} />
                      {student.improvement}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Trend</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-xl font-black tracking-tighter ${
                student.score >= 90 ? 'text-emerald-500' :
                student.score >= 80 ? 'text-primary' :
                'text-amber-500'
              }`}>
                {student.score}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12 m-auto">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
               <Trophy className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Data Available</p>
        </div>
      )}
    </div>
  );
}