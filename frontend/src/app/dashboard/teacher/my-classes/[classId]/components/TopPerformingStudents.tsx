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
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 2:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.5)]';
      case 3:
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_15px_rgba(251,146,60,0.5)]';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200/60 dark:border-slate-800/60 rounded-[3rem] p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <Award className="text-amber-500" size={24} />
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
            className="group flex items-center justify-between p-4 md:p-5 bg-white/40 dark:bg-slate-800/40 rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden cursor-pointer"
          >
            {/* Hover Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                <div className="w-14 h-14 rounded-[1.25rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <Image
                        src={student.avatar || `/users/user ${(idx % 6) + 1}.jpeg`}
                        alt={student.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white dark:border-slate-900 ${getRankStyle(student.rank)}`}>
                  {student.rank}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {student.name}
                </p>
                {/* Optional: Add real improvement metric here if backend provides it in the future */}
              </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm group-hover:scale-110 transition-transform origin-right">
                {student.score}%
              </div>
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