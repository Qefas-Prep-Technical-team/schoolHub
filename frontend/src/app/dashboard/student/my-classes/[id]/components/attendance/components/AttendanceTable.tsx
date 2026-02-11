'use client';

import { useState, useMemo } from 'react';
import { AttendanceRecord, AttendanceStatus } from './types';
import Card from './ui/Card';
import FilterButtons from './ui/FilterButtons';
import Badge from './ui/Badge';


interface AttendanceTableProps {
    records: AttendanceRecord[];
    title?: string;
}

export default function AttendanceTable({ records, title = "Daily Breakdown" }: AttendanceTableProps) {
    const [activeFilter, setActiveFilter] = useState<AttendanceStatus | 'all'>('all');

    // Filter records based on active filter
    const filteredRecords = useMemo(() => {
        if (activeFilter === 'all') return records;
        return records.filter(record => record.status === activeFilter);
    }, [records, activeFilter]);

    // Count records by status
    const statusCounts = useMemo(() => {
        const counts = {
            all: records.length,
            present: records.filter(r => r.status === 'present').length,
            absent: records.filter(r => r.status === 'absent').length,
            late: records.filter(r => r.status === 'late').length,
        };
        return counts;
    }, [records]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filters = [
        { key: 'all' as const, label: 'All', count: statusCounts.all },
        { key: 'present' as const, label: 'Present', count: statusCounts.present },
        { key: 'absent' as const, label: 'Absent', count: statusCounts.absent },
        { key: 'late' as const, label: 'Late', count: statusCounts.late },
    ];

    return (
        <Card title={title}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                            {title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Showing {filteredRecords.length} of {records.length} records
                        </p>
                    </div>

                    <FilterButtons
                        filters={filters}
                        activeFilter={activeFilter}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onFilterChange={(filter) => setActiveFilter(filter as any)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Date
                                </th>
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Status
                                </th>
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Class Topic
                                </th>
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="p-3 text-sm text-slate-900 dark:text-white">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="p-3 text-sm">
                                        <Badge status={record.status} />
                                    </td>
                                    <td className="p-3 text-sm text-slate-900 dark:text-white">
                                        {record.classTopic}
                                    </td>
                                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">
                                        {record.time || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRecords.length === 0 && (
                        <div className="p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">
                                search_off
                            </span>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                No records found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                No attendance records match your filter.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}