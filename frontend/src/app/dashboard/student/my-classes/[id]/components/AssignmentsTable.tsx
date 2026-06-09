'use client';

// app/student/classes/[id]/components/AssignmentsTable.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: 'graded' | 'submitted' | 'upcoming' | 'overdue';
  grade?: string;
  maxPoints?: number;
  type?: string;
  link?: string;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  hasDepartment: boolean;
  pageSize?: number;
}

export default function AssignmentsTable({
  assignments,
  hasDepartment,
  pageSize = 8,
}: AssignmentsTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(assignments.length / pageSize));
  // Reset to page 1 if current page exceeds total (e.g. filter change)
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginated = assignments.slice(startIdx, startIdx + pageSize);

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'graded':   return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'overdue':  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const getTypeBadgeStyles = (type?: string) => {
    switch (type) {
      case 'Exam':
        return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60';
      case 'Subject Paper':
        return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60';
      case 'Assignment':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60';
      case 'CA':
        return 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60';
      case 'Test (Quiz)':
        return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-900/60';
    }
  };

  const getActionText = (status: Assignment['status']) => {
    switch (status) {
      case 'graded':    return 'View Details';
      case 'submitted': return 'View Submission';
      case 'upcoming':  return 'View Assessment';
      case 'overdue':   return 'Submit Late';
    }
  };

  return (
    <Card>
      <CardContent className="p-0">

        {/* ── Table ─────────────────────────────────────────────────────── */}
        {assignments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginated.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeStyles(assignment.type)}`}>
                          {assignment.type || 'Assessment'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {assignment.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {assignment.grade || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {assignment.link && assignment.link !== '#' ? (
                          <Link href={assignment.link}>
                            <Button variant="ghost" size="sm" className="gap-1 cursor-pointer">
                              {getActionText(assignment.status)}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="sm" className="gap-1 cursor-pointer" disabled>
                            {getActionText(assignment.status)}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination bar ───────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Showing{' '}
                <span className="font-black text-gray-800 dark:text-gray-200">
                  {startIdx + 1}–{Math.min(startIdx + pageSize, assignments.length)}
                </span>{' '}
                of{' '}
                <span className="font-black text-gray-800 dark:text-gray-200">
                  {assignments.length}
                </span>{' '}
                assessments
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="h-8 w-8 p-0"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page pills */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`h-8 w-8 rounded-md text-xs font-black transition-all ${
                      pg === safePage
                        ? 'bg-indigo-600 text-white shadow dark:bg-indigo-500 dark:text-white hover:bg-indigo-700 dark:hover:bg-indigo-600'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="h-8 w-8 p-0"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* ── Empty state ────────────────────────────────────────────── */
          <div className="text-center py-16 px-6">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-800 dark:text-white font-black text-lg uppercase tracking-tight mb-2">
              No Assessments Currently
            </p>
            {!hasDepartment ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                Make sure your department is correctly set — department-specific exams and CA will appear here once configured.
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                No exams or assessments have been assigned to this class yet.
              </p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}