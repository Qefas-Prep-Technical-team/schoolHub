// src/components/Dashboard/AttendanceTable.tsx
import React from 'react';
import { AttendanceRecord } from './types';
import Badge from './ui/Badge';

const AttendanceTable: React.FC = () => {
    const attendanceRecords: AttendanceRecord[] = [
        { date: 'Oct 26, 2023', status: 'present', class: 'Mathematics', comment: '-' },
        { date: 'Oct 25, 2023', status: 'present', class: 'History', comment: '-' },
        { date: 'Oct 24, 2023', status: 'absent', class: 'Science', comment: 'Feeling unwell.' },
        { date: 'Oct 23, 2023', status: 'late', class: 'English', comment: 'Arrived 10 minutes late.' },
        { date: 'Oct 22, 2023', status: 'present', class: 'Physical Education', comment: '-' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-300 uppercase font-medium">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Class</th>
                            <th scope="col" className="px-6 py-3">Teacher Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceRecords.map((record, index) => (
                            <tr
                                key={index}
                                className={`
                  border-b dark:border-slate-700
                  ${index % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}
                `}
                            >
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    {record.date}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge status={record.status} />
                                </td>
                                <td className="px-6 py-4">{record.class}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                    {record.comment}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceTable;