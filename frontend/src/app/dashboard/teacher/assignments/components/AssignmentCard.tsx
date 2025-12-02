'use client';

import Link from 'next/link';
import { Assignment, AssignmentCardProps } from './types';
import Button from './ui/Button';


export default function AssignmentCard({
    assignment,
    onEdit,
    onGrade,
    onDelete,
    onViewDetails
}: AssignmentCardProps) {

    const getStatusStyles = (status: Assignment['status']) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            case 'overdue':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
            case 'due-soon':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
            case 'draft':
                return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300';
            default:
                return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: Assignment['status']) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    };

    const getActionButtonText = (status: Assignment['status']) => {
        switch (status) {
            case 'draft':
                return 'Continue Editing';
            default:
                return 'View Details';
        }
    };

    return (
        <div className="bg-white dark:bg-[#1A232E] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5 flex flex-col gap-4 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-[#0e121b] dark:text-white">
                        {assignment.title}
                    </h3>
                    <p className="text-sm text-[#506795] dark:text-[#9CA3AF]">
                        {assignment.subject} - {assignment.className}
                    </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyles(assignment.status)}`}>
                    {getStatusLabel(assignment.status)}
                </span>
            </div>

            <div className="text-sm text-[#506795] dark:text-[#9CA3AF]">
                <strong>Due:</strong> {assignment.dueDate}
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-[#0e121b] dark:text-white">
                        Submission Progress
                    </span>
                    <span className="text-sm font-medium text-[#506795] dark:text-[#9CA3AF]">
                        {assignment.submitted}/{assignment.totalStudents} Submitted
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${assignment.progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="border-t border-[#E5E7EB] dark:border-[#374151] pt-4 flex justify-end items-center gap-2">
                <button
                    onClick={() => onEdit?.(assignment.id)}
                    className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20"
                    title="Edit"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                </button>

                <button
                    onClick={() => onGrade?.(assignment.id)}
                    className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20"
                    title="Grade Submissions"
                >
                    <span className="material-symbols-outlined text-lg">grading</span>
                </button>

                <button
                    onClick={() => onDelete?.(assignment.id)}
                    className="p-2 rounded-full hover:bg-red-500/10"
                    title="Delete"
                >
                    <span className="material-symbols-outlined text-lg text-red-500">delete</span>
                </button>
                <Link href="/dashboard/teacher/assignments/preview">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewDetails?.(assignment.id)}
                    >
                        {getActionButtonText(assignment.status)}
                    </Button>
                </Link>
            </div>
        </div>
    );
}