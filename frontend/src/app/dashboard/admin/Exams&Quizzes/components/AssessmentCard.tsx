'use client';

import {
    School,
    User,
    Laptop,
    Calendar,
    Clock,
    MoreVertical
} from 'lucide-react';
import DropdownMenu from './ui/DropdownMenu';

interface Assessment {
    id: string;
    title: string;
    subject: string;
    class: string;
    teacher: string;
    type: string;
    date: string;
    duration: string;
    status: 'upcoming' | 'graded' | 'ongoing' | 'marking' | 'completed' | 'draft';
}

interface AssessmentCardProps {
    assessment: Assessment;
}

const statusStyles = {
    upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    graded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    ongoing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    marking: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const typeIcons = {
    CBT: Laptop,
    Assignment: Laptop, // Using same icon for simplicity
    Written: Laptop, // Using same icon for simplicity
};

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
    const TypeIcon = typeIcons[assessment.type as keyof typeof typeIcons] || Laptop;

    const menuItems = [
        { label: 'View', onClick: () => { } },
        { label: 'Edit', onClick: () => { } },
        { label: 'Publish', onClick: () => { } },
        { label: 'Delete', onClick: () => { }, destructive: true },
    ];

    return (
        <div className="flex flex-col bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {assessment.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {assessment.subject}
                        </p>
                    </div>

                    <DropdownMenu items={menuItems} />
                </div>

                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <School size={16} />
                        <span>Class: {assessment.class}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <User size={16} />
                        <span>Teacher: {assessment.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <TypeIcon size={16} />
                        <span>Type: {assessment.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar size={16} />
                        <span>{assessment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Clock size={16} />
                        <span>{assessment.duration}</span>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[assessment.status]
                    }`}>
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                </span>
            </div>
        </div>
    );
}