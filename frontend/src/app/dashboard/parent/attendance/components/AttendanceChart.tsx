'use client';

import { Shield } from 'lucide-react';
import CircularChart from './ui/CircularChart';
import StatsBreakdown from './ui/StatsBreakdown';

interface AttendanceChartProps {
    attendance: number;
    stats: {
        presentDays: number;
        lateDays: number;
        absentDays: number;
    };
    status?: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    onViewDetails?: () => void;
}

export default function AttendanceChart({
    attendance,
    stats,
    status = 'excellent',
    onViewDetails,
}: AttendanceChartProps) {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
            {/* Decorative Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield className="text-[150px]" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Circular Chart */}
                <CircularChart
                    value={attendance}
                    size="lg"
                    color="#356fe3"
                    label="Present"
                />

                {/* Breakdown Stats */}
                <StatsBreakdown
                    stats={stats}
                    status={status}
                    onViewDetails={onViewDetails}
                />
            </div>
        </div>
    );
}