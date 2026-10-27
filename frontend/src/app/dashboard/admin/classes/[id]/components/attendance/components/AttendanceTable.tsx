import React, { useState } from 'react';
import { Edit2, Eye, ChevronLeft, ChevronRight, BookOpen, School } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AttendanceRecord, ClassSubjectItem, getStudentApplicableSubjects } from './types';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  date: string;
  onEdit?: (record: AttendanceRecord) => void;
  onInspectRecord?: (record: AttendanceRecord) => void;
  selectedScope?: string;
  selectedScopeLabel?: string;
  classSubjects?: ClassSubjectItem[];
  isLoading?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  records, 
  date, 
  onEdit,
  onInspectRecord,
  selectedScope = 'daily',
  selectedScopeLabel = 'School Arrival (Daily)',
  classSubjects = [],
  isLoading
}) => {
  const pathname = usePathname();
  const isTeacher = pathname?.includes('/dashboard/teacher');
  const studentBaseRoute = isTeacher ? '/dashboard/teacher/students' : '/dashboard/admin/students';

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', { 
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
  }, [date, selectedScope]);

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
        bg: 'bg-emerald-100 dark:bg-emerald-950/60',
        text: 'text-emerald-800 dark:text-emerald-300',
        label: 'Present'
      },
      absent: {
        bg: 'bg-rose-100 dark:bg-rose-950/60',
        text: 'text-rose-800 dark:text-rose-300',
        label: 'Absent'
      },
      late: {
        bg: 'bg-amber-100 dark:bg-amber-950/60',
        text: 'text-amber-800 dark:text-amber-300',
        label: 'Late'
      },
      excused: {
        bg: 'bg-sky-100 dark:bg-sky-950/60',
        text: 'text-sky-800 dark:text-sky-300',
        label: 'Excused'
      },
      unrecorded: {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-500 dark:text-slate-400',
        label: 'Not Logged'
      }
    };

    const conf = config[status as keyof typeof config] || config.unrecorded;

    return (
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block ${conf.bg} ${conf.text}`}>
        {conf.label}
      </span>
    );
  };

  const isSubjectScope = selectedScope !== 'daily';

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Attendance Log: {formatDate(date)}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Scope:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {selectedScopeLabel}
            </span>
            <span className="text-slate-400 dark:text-slate-600">&bull;</span>
            <span className="text-[11px] text-slate-400">Click any row to inspect school & subject breakdown</span>
          </p>
        </div>

        {isSubjectScope && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Subject View Mode
          </span>
        )}
      </div>
      
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-150 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3" scope="col">S/N</th>
              <th className="px-4 py-3" scope="col">Student</th>
              <th className="px-4 py-3" scope="col">Student ID</th>
              <th className="px-4 py-3" scope="col">
                {isSubjectScope ? 'Subject Status' : 'School Status'}
              </th>
              <th className="px-4 py-3" scope="col">
                {isSubjectScope ? 'School Arrival' : 'Subjects Available'}
              </th>
              <th className="px-4 py-3" scope="col">Comment</th>
              <th className="px-4 py-3 text-right" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((record, index) => {
              const name = record.studentName || (record as any).student?.name || "Unknown Student";
              const code = record.studentCode || (record as any).student?.studentCode || "-";
              const commentText = record.comment || (record as any).note || "-";

              // Subject status calculation
              let targetSubjectStatus = 'unrecorded';
              if (isSubjectScope) {
                targetSubjectStatus = record.subjects?.[selectedScope]?.status || 'unrecorded';
              }

              // Compute subject presence summary filtered against student's enrolled department
              const studentDeptId = record.student?.departmentId || (record as any).student?.department?.id || record.departmentId || (record as any).departmentId;
              const studentDeptName = record.student?.department?.name || record.department?.name || (record as any).departmentName;
              const applicableSubjects = getStudentApplicableSubjects(studentDeptId, classSubjects);
              const totalApplicableSubs = applicableSubjects.length;
              let presentSubsCount = 0;
              if (record.subjects && totalApplicableSubs > 0) {
                applicableSubjects.forEach((sub) => {
                  if (record.subjects?.[sub.id]?.status === 'present') {
                    presentSubsCount++;
                  }
                });
              }

              return (
                <tr 
                  key={record.id} 
                  onClick={() => onInspectRecord?.(record)}
                  className="border-b dark:border-gray-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`${studentBaseRoute}/${record.studentId || (record as any).student?.id}?date=${date.split('T')[0]}&tab=attendance`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline text-primary font-bold cursor-pointer"
                      >
                        {name}
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectRecord?.(record);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity"
                        title="Inspect student attendance"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {code}
                  </td>
                  <td className="px-4 py-3">
                    {isSubjectScope 
                      ? getStatusBadge(targetSubjectStatus)
                      : getStatusBadge(record.status)
                    }
                  </td>
                  <td className="px-4 py-3">
                    {isSubjectScope ? (
                      <div className="flex items-center gap-1.5">
                        <School size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                          {record.status || 'Not Logged'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-indigo-500 shrink-0" />
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            presentSubsCount > 0 
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {presentSubsCount} / {totalApplicableSubs} Present
                          </span>
                        </div>
                        {studentDeptName && (
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 pl-5">
                            {studentDeptName}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate text-xs">
                    {commentText}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onInspectRecord?.(record)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        title={`Inspect details for ${name}`}
                        aria-label={`Inspect details for ${name}`}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit?.(record)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={`Edit attendance for ${name}`}
                        aria-label={`Edit attendance for ${name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedRecords.map((record) => {
          const name = record.studentName || (record as any).student?.name || "Unknown Student";
          const code = record.studentCode || (record as any).student?.studentCode || "-";
          const commentText = record.comment || (record as any).note || "-";

          let targetSubjectStatus = 'unrecorded';
          if (isSubjectScope) {
            targetSubjectStatus = record.subjects?.[selectedScope]?.status || 'unrecorded';
          }

          const studentDeptId = record.student?.departmentId || (record as any).student?.department?.id || record.departmentId || (record as any).departmentId;
          const studentDeptName = record.student?.department?.name || record.department?.name || (record as any).departmentName;
          const applicableSubjects = getStudentApplicableSubjects(studentDeptId, classSubjects);
          const totalApplicableSubs = applicableSubjects.length;
          let presentSubsCount = 0;
          if (record.subjects && totalApplicableSubs > 0) {
            applicableSubjects.forEach((sub) => {
              if (record.subjects?.[sub.id]?.status === 'present') {
                presentSubsCount++;
              }
            });
          }

          return (
            <div 
              key={record.id} 
              onClick={() => onInspectRecord?.(record)}
              className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-primary font-bold text-base truncate block">
                    {name}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono flex items-center gap-2">
                    <span>ID: {code}</span>
                    {studentDeptName && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                        {studentDeptName}
                      </span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {isSubjectScope 
                    ? getStatusBadge(targetSubjectStatus)
                    : getStatusBadge(record.status)
                  }
                </div>
              </div>

              {/* Subject Breakdown Pill */}
              <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-indigo-500" />
                  Subject Breakdown
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {presentSubsCount} of {totalApplicableSubs} Present
                </span>
              </div>
              
              {commentText !== "-" && (
                <div className="bg-white dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800/80">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Comment</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{commentText}</p>
                </div>
              )}
              
              <div className="mt-1 flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onInspectRecord?.(record)}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800"
                >
                  <Eye size={14} /> Inspect
                </button>
                <button
                  type="button"
                  onClick={() => onEdit?.(record)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </div>
          );
        })}
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
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, records.length)}</span> of{' '}
                <span className="font-medium">{records.length}</span> records
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
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