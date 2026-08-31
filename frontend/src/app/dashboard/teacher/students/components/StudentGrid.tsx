import { motion, AnimatePresence } from "framer-motion";
import StudentCard from "./StudentCard";
import { User, AlertCircle } from "lucide-react";
import { StudentGridSkeleton } from "./StudentSkeleton";
import { Student } from "./types";

interface StudentGridProps {
  students: Student[];
  isLoading: boolean;
  error: any;
  searchQuery: string;
  limit: number;
}

const StudentGrid: React.FC<StudentGridProps> = ({ students, isLoading, error, searchQuery, limit }) => {
  if (isLoading) {
    return <StudentGridSkeleton limit={limit} />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 rounded-2xl border border-red-100 bg-red-50/50 dark:bg-red-900/10"
      >
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/10 mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Failed to load students</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-sm text-center text-sm">
          {error instanceof Error ? error.message : "Please verify your connection." }
        </p>
      </motion.div>
    );
  }

  if (students.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10"
      >
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No students found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-center text-sm">
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
