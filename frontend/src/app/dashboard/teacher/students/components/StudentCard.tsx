import { ArrowRight, Calendar, Activity, GraduationCap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PerformanceBadge from "./PerformanceBadge";
import { Student } from "./types";
import { cn } from "@/lib/utils";

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const getAttendanceStyles = (attendance: number) => {
    if (attendance >= 95) return "text-blue-600 dark:text-blue-400 font-black bg-blue-500/10 px-2 py-0.5 rounded-md";
    if (attendance >= 85) return "text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded-md";
    if (attendance >= 40) return "text-amber-600 dark:text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded-md";
    return "text-rose-600 dark:text-rose-400 font-black bg-rose-500/10 px-2 py-0.5 rounded-md";
  };

  const initials = student.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/60 p-6 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-md">
      {/* Identity Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 group-hover:scale-110 transition-transform duration-500">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 text-white flex items-center justify-center overflow-hidden border border-white dark:border-emerald-800/50 shadow-xl shadow-emerald-500/20">
            {student.avatarUrl ? (
              <Image 
                src={student.avatarUrl} 
                alt={student.name} 
                width={64} 
                height={64} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-lg font-black tracking-tighter">{initials}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 dark:text-white text-lg font-black truncate leading-none mb-1">{student.name}</p>
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
            <GraduationCap size={12} className="text-emerald-500" />
            {student.grade}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-400 dark:text-slate-500 group-hover/stat:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">Performance</p>
          </div>
          <PerformanceBadge level={student.performance} />
        </div>
        
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 dark:text-slate-500 group-hover/stat:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">Attendance</p>
          </div>
          <p className={cn("text-xs transition-transform group-hover/stat:scale-110 duration-300", getAttendanceStyles(student.attendance))}>
            {student.attendance}%
          </p>
        </div>
        
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <span className="text-[8px] font-black text-slate-500 dark:text-slate-400">EX</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">Last Exam</p>
          </div>
          <p className="text-xs text-slate-900 dark:text-slate-100 font-black tracking-tight group-hover/stat:text-emerald-500 transition-colors">{student.lastExam}</p>
        </div>
      </div>

      <Link href={`/dashboard/teacher/students/${student.id}`} className="mt-2"> 
        <button className="flex w-full items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-900 dark:bg-emerald-900/40 text-white dark:text-slate-200 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95 group/btn border border-transparent dark:border-emerald-700/50">
          View Detailed Profile
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </Link>
    </div>
  );
};

export default StudentCard;
