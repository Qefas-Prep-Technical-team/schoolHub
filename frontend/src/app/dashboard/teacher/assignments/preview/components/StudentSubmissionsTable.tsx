'use client';

import { StudentSubmission } from './types';

import Image from 'next/image';
import Link from 'next/link';
import StatusBadge from './ui/StatusBadge';

interface StudentSubmissionsTableProps {
    submissions: StudentSubmission[];
    onGradeStudent?: (submissionId: string) => void;
    onViewGrade?: (submissionId: string) => void;
}

export default function StudentSubmissionsTable({
    submissions,
    onGradeStudent,
    onViewGrade
}: StudentSubmissionsTableProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatScore = (submission: StudentSubmission) => {
        if (!submission.graded || submission.score === null) {
            return (
                <span className="text-gray-500 dark:text-gray-400">
                    Not Graded
                </span>
            );
        }

        return (
            <span className="text-gray-900 dark:text-white font-medium">
                {submission.score}/{submission.maxScore}
            </span>
        );
    };

    return (
        <div className="mt-8 bg-white dark:bg-[#191e2b] rounded-xl overflow-hidden">
            <div className="p-6">
                <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                    Student Submissions
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3" scope="col">Student Name</th>
                            <th className="px-6 py-3" scope="col">Submission Time</th>
                            <th className="px-6 py-3" scope="col">Status</th>
                            <th className="px-6 py-3" scope="col">Score</th>
                            <th className="px-6 py-3" scope="col"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {submissions.map((submission) => (
                            <tr
                                key={submission.id}
                                className="bg-white dark:bg-[#191e2b] border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap" scope="row">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8">
                                            <Image
                                                src={submission.student.avatarUrl}
                                                alt={`${submission.student.name}'s avatar`}
                                                fill
                                                className="rounded-full object-cover"
                                                sizes="32px"
                                            />
                                        </div>
                                        {submission.student.name}
                                    </div>
                                </th>

                                <td className="px-6 py-4">
                                    {formatDate(submission.submissionTime)}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={submission.status} />
                                </td>

                                <td className="px-6 py-4">
                                    {formatScore(submission)}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    {submission.graded ? (
                                        <button
                                            onClick={() => onViewGrade?.(submission.id)}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            View Grade
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onGradeStudent?.(submission.id)}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            Grade
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {submissions.length === 0 && (
                <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                        search_off
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No submissions yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Students haven &apos;t submitted their work yet.
                    </p>
                </div>
            )}
        </div>
    );
}