'use client';

import { Fragment, useMemo } from 'react';
import { StudentSubmission } from './types';
import StudentGradingRow from './StudentGradingRow';
import { groupByDate } from '@/app/dashboard/teacher/utils/dateSectioning';

interface StudentGradingTableProps {
  submissions: StudentSubmission[];
  onScoreChange: (submissionId: string, score: number) => void;
  onViewSubmission?: (submissionId: string) => void;
  onDownloadFile?: (submissionId: string) => void;
  gradingSystem?: any[] | null;
}

export default function StudentGradingTable({ 
  submissions, 
  onScoreChange,
  onViewSubmission,
  onDownloadFile,
  gradingSystem 
}: StudentGradingTableProps) {
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      // Sort by status priority
      const statusOrder = { 'graded': 0, 'ungraded': 1, 'late': 2, 'not-submitted': 3 };
      return statusOrder[a.status] - statusOrder[b.status] || a.name.localeCompare(b.name);
    });
  }, [submissions]);

  const groupedSubmissions = useMemo(() => {
    return groupByDate(sortedSubmissions, (s) => s.submittedAt);
  }, [sortedSubmissions]);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400" scope="col">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400" scope="col">
              Submitted
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400" scope="col">
              File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400" scope="col">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400" scope="col">
              Status
            </th>
            <th className="relative px-6 py-3" scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {groupedSubmissions.map((group) => (
            <Fragment key={group.label}>
              <tr className="bg-slate-50/90 dark:bg-slate-800/70 border-y border-slate-200/70 dark:border-slate-700/70">
                <td colSpan={6} className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                      {group.items.length} {group.items.length === 1 ? 'submission' : 'submissions'}
                    </span>
                  </div>
                </td>
              </tr>
              {group.items.map((submission) => (
                <StudentGradingRow
                  key={submission.id}
                  submission={submission}
                  onScoreChange={onScoreChange}
                  onViewSubmission={onViewSubmission}
                  onDownloadFile={onDownloadFile}
                  gradingSystem={gradingSystem}
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      {submissions.length === 0 && (
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">
            group_off
          </span>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No submissions found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            No students have been assigned to this assignment yet.
          </p>
        </div>
      )}
    </div>
  );
}
