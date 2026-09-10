import { motion, AnimatePresence } from "framer-motion";
import { Student } from "./types";
import { User, AlertCircle, ArrowRight, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PerformanceBadge from "./PerformanceBadge";
import { cn } from "@/lib/utils";

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  error: any;
  searchQuery: string;
  currentPage?: number;
  itemsPerPage?: number;
}

const StudentList: React.FC<StudentListProps> = ({ students, isLoading, error, searchQuery, currentPage = 1, itemsPerPage = 8 }) => {
  const getAttendanceStyles = (attendance: number) => {
    if (attendance >= 95) return "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30";
    if (attendance >= 85) return "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/30";
    if (attendance >= 40) return "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30";
    return "text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-800/30";
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-slate-50 dark:bg-emerald-900/40 border-b border-slate-200 dark:border-emerald-800/50" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex h-20 items-center px-6 border-b border-slate-100 dark:border-emerald-800/40">
            <div className="w-8 bg-slate-200 dark:bg-slate-700 h-4 rounded mr-4" />
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 mr-4" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mr-auto" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mr-12" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mr-12" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 rounded-2xl border border-red-100 bg-red-50/50 dark:bg-red-900/10"
      >
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Failed to load students</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm text-center">
          {error instanceof Error ? error.message : "Please try again later." }
        </p>
      </motion.div>
    );
  }

  if (students.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-emerald-800/50 bg-slate-50/50 dark:bg-emerald-950/60/10"
      >
        <div className="p-4 rounded-full bg-slate-100 dark:bg-emerald-900/40 mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No students found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center">
          {searchQuery ? `No results for "${searchQuery}"` : "This class has no students assigned yet."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-emerald-900/40 border-b border-slate-200 dark:border-emerald-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold w-12 text-center">#</th>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Grade</th>
              <th className="px-6 py-4 font-semibold">Performance</th>
              <th className="px-6 py-4 font-semibold">Attendance</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-emerald-800/50">
            <AnimatePresence>
              {students.map((student, idx) => {
                const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                
                return (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                        {absoluteIndex}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center overflow-hidden font-bold border border-emerald-200 dark:border-emerald-800">
                          {student.avatarUrl ? (
                            <Image src={student.avatarUrl} alt={student.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{student.studentCode || student.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <GraduationCap size={14} className="text-slate-400" />
                        {student.grade}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PerformanceBadge level={student.performance} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs transition-transform duration-300", getAttendanceStyles(student.attendance))}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/teacher/students/${student.id}`}>
                        <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all">
                          View Profile
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

export default StudentList;
