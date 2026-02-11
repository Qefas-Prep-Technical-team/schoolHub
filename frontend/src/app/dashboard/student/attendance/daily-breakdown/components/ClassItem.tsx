// src/components/Dashboard/ClassItem.tsx
import React from 'react';
import { ClassItem } from './types';
import Badge from './ui/Badge';
import Link from 'next/link';

const ClassItemComponent: React.FC<ClassItem> = ({
    icon,
    title,
    time,
    teacher,
    status,
    comment
}) => {
    return (
        <Link href={"/dashboard/student/attendance/subject/1"} className="flex flex-col cursor-pointer md:flex-row gap-4 px-5 py-4 justify-between">
            <div className="flex items-start gap-4">
                <div className="text-gray-700 dark:text-gray-300 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 size-12">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <p className="text-gray-900 dark:text-white text-base font-medium">
                        {title}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base">person</span>
                        <p className="text-sm font-normal">{time} - {teacher}</p>
                    </div>
                    {comment && (
                        <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 mt-1">
                            <span className="material-symbols-outlined text-base mt-0.5">comment</span>
                            <p className="text-sm font-normal">{comment}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="shrink-0 flex items-center justify-end md:justify-center">
                <Badge status={status} />
            </div>
        </Link>
    );
};

export default ClassItemComponent;