import { useQuery } from "@tanstack/react-query";
import StudentCard from "./StudentCard";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { User, Loader2 } from "lucide-react";

interface StudentGridProps {
  page: number;
  searchQuery: string;
  limit: number;
  onDataLoaded: (total: number) => void;
}

const StudentGrid: React.FC<StudentGridProps> = ({ page, searchQuery, limit, onDataLoaded }) => {
  const { selectedSchoolId } = useDashboardStore();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-students', selectedSchoolId, searchQuery, page, limit],
    queryFn: async () => {
      const result = await teacherService.getStudents({
        schoolId: selectedSchoolId || undefined,
        search: searchQuery || undefined,
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
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-[300px] border border-gray-100 dark:border-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200 dark:border-red-800">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-900 dark:text-red-100">Failed to load students</h3>
        <p className="text-red-600 dark:text-red-400 mt-2 max-w-xs text-center text-sm font-medium">
          {(error as any)?.message || "There was an error fetching the student list. Please try again." }
        </p>
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
          {searchQuery 
            ? `No students matching "${searchQuery}" found.` 
            : "We couldn't find any students assigned to you in this school context."}
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