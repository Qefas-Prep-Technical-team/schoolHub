import React from 'react';
import { Edit2 } from 'lucide-react';
import { AttendanceRecord } from './types';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  date: string;
  onEdit?: (record: AttendanceRecord) => void;
  isLoading?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  records, 
  date, 
  onEdit,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config = {
      present: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        label: 'Present'
      },
      absent: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
        label: 'Absent'
      },
      late: {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-800 dark:text-yellow-200',
        label: 'Late'
      },
      excused: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        label: 'Excused'
      }
    };

    const { bg, text, label } = config[status as keyof typeof config] || config.present;

    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Attendance for: {formatDate(date)}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3" scope="col">Student</th>
              <th className="px-4 py-3" scope="col">Student ID</th>
              <th className="px-4 py-3" scope="col">Status</th>
              <th className="px-4 py-3" scope="col">Comment</th>
              <th className="px-4 py-3" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const name = record.studentName || (record as any).student?.name || "Unknown Student";
              const code = record.studentCode || (record as any).student?.studentCode || "-";
              const commentText = record.comment || (record as any).note || "-";
              return (
                <tr key={record.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {code}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {commentText}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit?.(record)}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                      aria-label={`Edit attendance for ${name}`}
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {records.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No attendance records found for this date
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;