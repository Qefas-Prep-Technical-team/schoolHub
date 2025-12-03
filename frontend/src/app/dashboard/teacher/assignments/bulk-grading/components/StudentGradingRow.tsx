'use client';

import { useState } from 'react';
import { StudentSubmission } from './types';
import Image from 'next/image';
import Link from 'next/link';
import Input from '../../create-assignment/components/ui/Input';
import StatusBadge from './StatusBadge';

interface StudentGradingRowProps {
  submission: StudentSubmission;
  onScoreChange: (submissionId: string, score: number) => void;
  onViewSubmission?: (submissionId: string) => void;
  onDownloadFile?: (submissionId: string) => void;
}

export default function StudentGradingRow({ 
  submission, 
  onScoreChange,
  onViewSubmission,
  onDownloadFile 
}: StudentGradingRowProps) {
  const [localScore, setLocalScore] = useState<string>(submission.score?.toString() || '');

  const handleScoreChange = (value: string) => {
    setLocalScore(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onScoreChange(submission.id, numericValue);
    }
  };

  const handleBlur = () => {
    if (localScore === '') {
      setLocalScore(submission.score?.toString() || '');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      {/* Student Info */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9">
            <Image
              src={submission.avatarUrl}
              alt={`${submission.name}'s avatar`}
              fill
              className="rounded-full object-cover"
              sizes="36px"
            />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {submission.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ID: {submission.studentId}
            </div>
          </div>
        </div>
      </td>

      {/* Submission Date */}
      <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-400">
        {formatDate(submission.submittedAt)}
      </td>

      {/* File */}
      <td className="whitespace-nowrap px-6 py-4 text-center">
        {submission.fileUrl ? (
          <Link href={"/dashboard/teacher/assignments/preview-assignment/123"}>
          <button
            onClick={() => onDownloadFile?.(submission.id)}
            className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
            title="Download submission"
          >
            <span className="material-symbols-outlined text-xl">
              attach_file
            </span>
          </button>
          </Link>
        ) : (
          <span className="text-slate-400 dark:text-slate-600" title="No file submitted">
            <span className="material-symbols-outlined text-xl">
              link_off
            </span>
          </span>
        )}
      </td>

      {/* Score Input */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative w-20">
            <Input
              type="number"
              min="0"
              max={submission.maxScore}
              value={localScore}
              onChange={(e) => handleScoreChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="--"
              className="text-center py-1.5 text-sm"
              disabled={submission.status === 'not-submitted'}
            />
          </div>
          <span className="text-slate-500 dark:text-slate-400">
            / {submission.maxScore}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="whitespace-nowrap px-6 py-4">
        <StatusBadge status={submission.status} />
      </td>

      {/* Actions */}
      <td className="whitespace-nowrap px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {submission.fileUrl && (
            <button
              onClick={() => onViewSubmission?.(submission.id)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              title="View submission details"
            >
              View
            </button>
          )}
          
          <div className="relative group">
            <button
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              title="More options"
            >
              <span className="material-symbols-outlined text-xl">
                more_vert
              </span>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full z-10 hidden min-w-[160px] rounded-lg border border-slate-200 bg-white p-2 shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => onViewSubmission?.(submission.id)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                View Details
              </button>
              
              {submission.fileUrl && (
                <button
                  onClick={() => onDownloadFile?.(submission.id)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Download File
                </button>
              )}
              
              <button
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-base">feedback</span>
                Add Feedback
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}