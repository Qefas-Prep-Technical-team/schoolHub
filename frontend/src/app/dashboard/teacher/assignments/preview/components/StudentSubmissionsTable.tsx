'use client';

import { StudentSubmission } from './types';

import Image from 'next/image';
import Link from 'next/link';
import StatusBadge from './ui/StatusBadge';
import { useState } from 'react';
import Pagination from '../../components/Pagination';

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const formatScore = (submission: any) => {
        const isGraded = submission.status === 'GRADED' || submission.graded;
        if (!isGraded || submission.score === null) {
            return (
                <span className="text-gray-500 dark:text-gray-400">
                    Not Graded
                </span>
            );
        }

        return (
            <span className="text-gray-900 dark:text-white font-medium">
                {submission.score}/{submission.maxScore || submission.assignment?.totalMarks || 100}
            </span>
        );
    };

    return (
        <div className="mt-8 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl overflow-hidden">
            <div className="p-6">
                <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                    Student Submissions
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-emerald-800 dark:text-emerald-200 uppercase bg-emerald-100/50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800/40">
                        <tr>
                            <th className="px-6 py-3 w-16 text-center" scope="col">#</th>
                            <th className="px-6 py-3" scope="col">Student Name</th>
                            <th className="px-6 py-3" scope="col">Submission Time</th>
                            <th className="px-6 py-3" scope="col">Status</th>
                            <th className="px-6 py-3" scope="col">Score</th>
                            <th className="px-6 py-3" scope="col"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {submissions
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((submission, index) => (
                            <tr
                                key={submission.id}
                                className="bg-transparent border-b border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/20"
                            >
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap" scope="row">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 flex-shrink-0">
                                            {submission.student?.profileImage || submission.student?.avatarUrl ? (
                                                <Image
                                                    src={submission.student.profileImage || submission.student.avatarUrl}
                                                    alt={`${submission.student?.name || 'Student'}'s avatar`}
                                                    fill
                                                    className="rounded-full object-cover bg-gray-100"
                                                    sizes="32px"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                                                    {(submission.student?.name || 'S').charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium">{submission.student?.name || 'Unknown Student'}</span>
                                    </div>
                                </th>

                                <td className="px-6 py-4">
                                    {formatDate(submission.submittedAt || submission.createdAt || submission.submissionTime)}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={submission.status} />
                                </td>

                                <td className="px-6 py-4">
                                    {formatScore(submission)}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    {(submission.status === 'GRADED' || submission.graded) ? (
                                        <button
                                            onClick={() => onViewGrade?.(submission.id)}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            View Grade
                                        </button>
                                    ) : onGradeStudent ? (
                                        <button
                                            onClick={() => onGradeStudent(submission.id)}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            Grade
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {submissions.length > itemsPerPage && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(submissions.length / itemsPerPage)}
                        totalItems={submissions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

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
