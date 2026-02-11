import { ThumbsUp } from 'lucide-react';

interface AttendanceAlertProps {
  attendanceRate: number;
  message: string;
}

export default function AttendanceAlert({ attendanceRate, message }: AttendanceAlertProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-300">
      <div className="p-2 bg-white dark:bg-green-800 rounded-full shadow-sm flex items-center justify-center">
        <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-300" />
      </div>
      
      <div className="flex-1">
        <p className="font-bold text-sm">Excellent Attendance!</p>
        <p className="text-sm opacity-90">
          {message.replace('{rate}', `${attendanceRate}%`)}
        </p>
      </div>
    </div>
  );
}