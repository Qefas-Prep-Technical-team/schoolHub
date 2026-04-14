import { useQuery } from "@tanstack/react-query";
import StudentCard from "./StudentCard";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { User } from "lucide-react";

const StudentGrid: React.FC = () => {
  const { selectedSchoolId } = useDashboardStore();
  
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['teacher-students', selectedSchoolId],
    queryFn: () => teacherService.getStudents(selectedSchoolId || undefined),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-[300px] border border-gray-100 dark:border-gray-700"></div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No students found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs text-center">
          We couldn&apos;t find any students assigned to you in this school context.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student: any) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};

export default StudentGrid;