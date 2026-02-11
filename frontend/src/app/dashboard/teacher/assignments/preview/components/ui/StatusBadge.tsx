'use client';

import { AssignmentStatus, SubmissionStatus } from "../types";



interface StatusBadgeProps {
    status: AssignmentStatus | SubmissionStatus;
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'published':
            case 'on-time':
                return {
                    bg: 'bg-green-100 dark:bg-green-900/50',
                    text: 'text-green-800 dark:text-green-300',
                    label: 'Published'
                };
            case 'draft':
                return {
                    bg: 'bg-gray-100 dark:bg-gray-700/50',
                    text: 'text-gray-800 dark:text-gray-300',
                    label: 'Draft'
                };
            case 'scheduled':
                return {
                    bg: 'bg-blue-100 dark:bg-blue-900/50',
                    text: 'text-blue-800 dark:text-blue-300',
                    label: 'Scheduled'
                };
            case 'late':
                return {
                    bg: 'bg-orange-100 dark:bg-orange-900/50',
                    text: 'text-orange-800 dark:text-orange-300',
                    label: 'Late'
                };
            case 'missing':
                return {
                    bg: 'bg-red-100 dark:bg-red-900/50',
                    text: 'text-red-800 dark:text-red-300',
                    label: 'Missing'
                };
            case 'graded':
                return {
                    bg: 'bg-purple-100 dark:bg-purple-900/50',
                    text: 'text-purple-800 dark:text-purple-300',
                    label: 'Graded'
                };
            default:
                return {
                    bg: 'bg-gray-100 dark:bg-gray-700/50',
                    text: 'text-gray-800 dark:text-gray-300',
                    label: status
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div className={`flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full px-3 ${config.bg} ${config.text} ${className}`}>
            <p className="text-sm font-medium leading-normal capitalize">
                {config.label}
            </p>
        </div>
    );
}