import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import StudentCard from "./StudentCard";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { User, AlertCircle } from "lucide-react";
import { StudentGridSkeleton } from "./StudentSkeleton";
import { Student } from "./types";

interface StudentGridProps {
  page: number;
  searchQuery: string;
  selectedClassId?: string;
  limit: number;
  onDataLoaded: (total: number) => void;
}

const StudentGrid: React.FC<StudentGridProps> = ({ page, searchQuery, selectedClassId, limit, onDataLoaded }) => {
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-students', selectedSchoolId, searchQuery, selectedClassId, page, limit],
    queryFn: async () => {
      const isPersonal = selectedSchoolName === "Personal Dashboard" || selectedSchoolId === user?.id;
      const filterId = isPersonal ? undefined : selectedSchoolId;
      const result = await teacherService.getStudents({
        schoolId: filterId || undefined,
        search: searchQuery || undefined,
        classId: selectedClassId || undefined,
        page,
        limit,
      });
      if (result?.total !== undefined) {
        onDataLoaded(result.total);
      }
      return result;
    },
  });

  const students = data?.students || [];

  if (isLoading) {
    return <StudentGridSkeleton limit={limit} />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 rounded-[3rem] border border-red-100 bg-red-50/50 dark:bg-red-900/10"
      >
        <div className="p-5 rounded-full bg-red-100 dark:bg-red-900/10 mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 italic">&quot;The Connection was Severed&quot;</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-sm text-center text-sm font-bold uppercase tracking-widest leading-relaxed">
          {error instanceof Error ? error.message : "Failed to synchronize student records. Please verify your connection." }
        </p>
      </motion.div>
    );
  }

  if (students.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10"
      >
        <div className="p-5 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <User className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Silent Corridors</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-sm text-center text-sm font-black uppercase tracking-[0.15em] leading-relaxed">
          {searchQuery 
            ? `No records found for "${searchQuery}"` 
            : "No students are currently assigned to this academic section."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {students.map((student: Student, index: number) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.05,
              ease: [0.23, 1, 0.32, 1] 
            }}
          >
            <StudentCard student={student} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default StudentGrid;
