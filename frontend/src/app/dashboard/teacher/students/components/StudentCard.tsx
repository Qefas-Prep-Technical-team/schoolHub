
import Link from "next/link";
import PerformanceBadge from "./PerformanceBadge";
import { Student } from "./types";


interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const getAttendanceColor = (attendance: number) => {
    return attendance < 85 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200';
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 transition-shadow hover:shadow-lg dark:hover:shadow-primary/10">
      <div className="flex items-center gap-4">
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
          style={{ backgroundImage: `url("${student.avatarUrl}")` }}
        />
        <div className="flex flex-col">
          <p className="text-gray-900 dark:text-white font-bold">{student.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{student.grade}</p>
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