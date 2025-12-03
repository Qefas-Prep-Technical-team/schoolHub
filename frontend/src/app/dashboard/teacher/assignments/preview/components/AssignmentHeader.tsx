'use client';

import Link from 'next/link';
import Button from '../../components/ui/Button';
import { Assignment } from './types';
import StatusBadge from './ui/StatusBadge';

interface AssignmentHeaderProps {
    assignment: Assignment;
    onEdit?: () => void;
    onGradeAll?: () => void;
}

export default function AssignmentHeader({
    assignment,
    onEdit,
    onGradeAll
}: AssignmentHeaderProps) {
    const formatClasses = (classes: string[]) => {
        return classes.join(', ');
    };

    return (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        {assignment.title}
                    </h1>
                    <StatusBadge status={assignment.status} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                    {assignment.subject} • {formatClasses(assignment.classes)} • Due: {assignment.dueDate}
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    icon="edit"
                    onClick={onEdit}
                >
                    Edit Assignment
                </Button>
                <Link href={`/dashboard/teacher/assignments/preview-assignment/${assignment.id}`}>
                
                <Button
                    icon="grading"
                    onClick={onGradeAll}
                    className="cursor-pointer"
                >
                    Grade All
                </Button>
                </Link>
            </div>
        </div>
    );
}