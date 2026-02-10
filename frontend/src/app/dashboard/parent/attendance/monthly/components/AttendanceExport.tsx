'use client';

import { Download, CalendarPlus } from 'lucide-react';
import { useState } from 'react';

interface AttendanceExportProps {
    onExport: () => void;
    onRequestLeave: () => void;
    childName?: string;
    className?: string;
}

export default function AttendanceExport({
    onExport,
    onRequestLeave,
    childName = 'Alex Johnson',
    className = '',
}: AttendanceExportProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport();
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Attendance Record
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {childName} • Grade 5B
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center justify-center h-10 px-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Report'}
                </button>

                <button
                    onClick={onRequestLeave}
                    className="flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-colors"
                >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Request Leave
                </button>
            </div>
        </div>
    );
}