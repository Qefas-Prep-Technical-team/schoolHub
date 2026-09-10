import { motion, AnimatePresence } from "framer-motion";
import { Class } from "./type";
import { GraduationCap, ArrowRight, Users, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ClassListProps {
  classes: Class[];
  onClassClick: (classId: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({ classes, onClassClick }) => {
  const getAttendanceStyles = (attendance: number) => {
    if (attendance >= 95) return "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30";
    if (attendance >= 85) return "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/30";
    if (attendance >= 40) return "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30";
    return "text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-800/30";
  };

  const getGradeStyles = (grade: number) => {
    if (grade >= 90) return "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30";
    if (grade >= 75) return "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/30";
    if (grade >= 40) return "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30";
    return "text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-800/30";
  };

  const getPendingStyles = (pending: number) => {
    if (pending === 0) return "text-slate-500 dark:text-slate-400 font-medium";
    if (pending <= 2) return "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30";
    if (pending <= 5) return "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30";
    return "text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-800/30";
  };

  return (
    <div className="w-full bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-emerald-900/40 border-b border-slate-200 dark:border-emerald-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold w-12 text-center">#</th>
              <th className="px-6 py-4 font-semibold">Class Info</th>
              <th className="px-6 py-4 font-semibold">Level / Schedule</th>
              <th className="px-6 py-4 font-semibold">Class GPA</th>
              <th className="px-6 py-4 font-semibold">Attendance</th>
              <th className="px-6 py-4 font-semibold">Pending</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-emerald-800/50">
            <AnimatePresence>
              {classes.map((cls, idx) => {
                const pendingCount = (cls.assignments || 0) + (cls.exams || 0);
                
                return (
                  <motion.tr 
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-emerald-900/40 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-emerald-700/50">
                          <Image src={cls.image || '/users/user 1.jpeg'} alt={cls.name} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{cls.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <GraduationCap size={12} /> {cls.subject}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <span>{cls.level || 'N/A'}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                           <span className="flex items-center gap-1"><Users size={12}/> {cls.studentCount}</span>
                           <span className="flex items-center gap-1"><Clock size={12}/> {cls.schedule?.[0] || 'Period 1'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs transition-transform duration-300 inline-block", getGradeStyles(cls.averageGrade))}>
                        {cls.averageGrade}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs transition-transform duration-300 inline-block", getAttendanceStyles(cls.attendance))}>
                        {cls.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pendingCount > 0 ? (
                         <span className={cn("text-xs transition-transform duration-300 inline-block", getPendingStyles(pendingCount))}>
                            {pendingCount} Tasks
                         </span>
                      ) : (
                         <span className="text-xs font-medium text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/teacher/my-classes/${cls.id}`} onClick={() => onClassClick(cls.id)}>
                        <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all">
                          Enter
                          <ArrowRight size={14} />
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassList;
