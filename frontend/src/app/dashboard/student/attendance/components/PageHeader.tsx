'use client';

import React from 'react';
import SegmentedControl from './SegmentedControl';
import { CalendarCheck, ShieldCheck } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface PageHeaderProps {
    records?: any[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ records = [] }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
                    <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Attendance Registry
                        </h1>
                        <HeaderTooltip 
                            content="Comprehensive ledger of your verified school attendance sessions. Demonstrates presence frequency across terms, helping identify patterns and ensure eligibility for end-of-term examinations."
                        />
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Track your verified daily presence, tardiness, and absences across academic terms.
                    </p>
                </div>
            </div>
            <SegmentedControl records={records} />
        </div>
    );
};

export default PageHeader;

