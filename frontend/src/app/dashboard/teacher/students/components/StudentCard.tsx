import { User } from "lucide-react";
import Link from "next/link";
import PerformanceBadge from "./PerformanceBadge";
import { Student } from "./types";

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const getAttendanceColor = (attendance: number) => {
    return attendance < 85 ? 'text-red-500 font-bold' : 'text-gray-800 dark:text-gray-200';
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md p-5 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 shrink-0">
          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white font-black truncate">{student.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">{student.grade}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">Performance</p>
        <PerformanceBadge level={student.performance} />
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">Attendance</p>
        <p className={`font-medium ${getAttendanceColor(student.attendance)}`}>
          {student.attendance}%
        </p>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">Last Exam</p>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{student.lastExam}</p>
      </div>
      <Link href="/dashboard/teacher/students/StudentProfile"> 
      <button className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <span className="truncate">View Profile</span>
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
      </Link>
    </div>
  );
};

export default StudentCard;