// src/components/Dashboard/ClassBreakdown.tsx
import React from 'react';
import { ClassItem } from './types';
import ClassItemComponent from './ClassItem';

const ClassBreakdown: React.FC = () => {
    const classes: ClassItem[] = [
        {
            id: '1',
            icon: 'calculate',
            title: 'Algebra II',
            time: '09:00 AM',
            teacher: 'Mr. Harrison',
            status: 'present',
            comment: 'Great participation in today\'s discussion!'
        },
        {
            id: '2',
            icon: 'history_edu',
            title: 'AP English Literature',
            time: '10:15 AM',
            teacher: 'Ms. Albright',
            status: 'present'
        },
        {
            id: '3',
            icon: 'science',
            title: 'Chemistry',
            time: '11:30 AM',
            teacher: 'Dr. Evans',
            status: 'late'
        },
        {
            id: '4',
            icon: 'public',
            title: 'World History',
            time: '01:00 PM',
            teacher: 'Mrs. Davis',
            status: 'absent'
        }
    ];

    return (
        <div>
            <h2 className="text-gray-900 dark:text-white text-[22px] font-bold tracking-[-0.015em] pb-3">
                Class Breakdown
            </h2>
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
                {classes.map((classItem, index) => (
                    <ClassItemComponent key={classItem.id} {...classItem} />
                ))}
            </div>
        </div>
    );
};

export default ClassBreakdown;