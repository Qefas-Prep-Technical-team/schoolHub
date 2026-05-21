import React, { useState } from 'react';
import { Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil((records?.length || 0) / itemsPerPage);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [date]);

  const paginatedRecords = records?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

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
            {paginatedRecords.map((record) => {
              const name = record.studentName || (record as any).student?.name || "Unknown Student";
              const code = record.studentCode || (record as any).student?.studentCode || "-";
              const commentText = record.comment || (record as any).note || "-";
              return (
                <tr key={record.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <Link
                      href={`/dashboard/admin/students/${record.studentId || (record as any).student?.id}?date=${date.split('T')[0]}&tab=attendance`}
                      className="hover:underline text-primary font-bold cursor-pointer"
                    >
                      {name}
                    </Link>
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
      
      {records.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 mt-4 rounded-b-xl">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, records.length)}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{records.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {(() => {
                  const getVisiblePages = () => {
                    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
                    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                  };

                  return getVisiblePages().map((page, i) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-offset-0">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 transition-colors ${
                          currentPage === page 
                            ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                            : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;