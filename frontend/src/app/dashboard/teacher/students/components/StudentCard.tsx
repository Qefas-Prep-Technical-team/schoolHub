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
    if (attendance < 75) return "text-red-600 dark:text-red-400 font-black bg-red-500/10 px-2 py-0.5 rounded-md";
    if (attendance < 90) return "text-amber-600 dark:text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded-md";
    return "text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded-md";
  };

  const initials = student.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Identity Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 group-hover:scale-110 transition-transform duration-500">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/40 text-white flex items-center justify-center overflow-hidden border border-white dark:border-slate-800 shadow-xl shadow-primary/20">
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
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 dark:text-white text-lg font-black truncate leading-none mb-1">{student.name}</p>
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest leading-none">
            <GraduationCap size={12} className="text-primary" />
            {student.grade}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-400 group-hover/stat:text-primary transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Performance</p>
          </div>
          <PerformanceBadge level={student.performance} />
        </div>
        
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 group-hover/stat:text-primary transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Attendance</p>
          </div>
          <p className={cn("text-xs transition-transform group-hover/stat:scale-110 duration-300", getAttendanceStyles(student.attendance))}>
            {student.attendance}%
          </p>
        </div>
        
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-[8px] font-black text-slate-500">EX</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Last Exam</p>
          </div>
          <p className="text-xs text-slate-900 dark:text-slate-100 font-black tracking-tight group-hover/stat:text-primary transition-colors">{student.lastExam}</p>
        </div>
      </div>

      <Link href="/dashboard/teacher/students/StudentProfile" className="mt-2"> 
        <button className="flex w-full items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95 group/btn">
          View Detailed Profile
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </Link>
    </div>
  );
};

export default StudentCard;
