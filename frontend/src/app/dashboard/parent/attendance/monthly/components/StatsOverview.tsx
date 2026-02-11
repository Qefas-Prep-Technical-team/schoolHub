import { TrendingUp } from 'lucide-react';
import StatCard from './ui/StatCard';


interface StatsOverviewProps {
    stats: {
        attendanceRate: number;
        daysPresent: number;
        daysAbsent: number;
        timesLate: number;
    };
    showChange?: boolean;
}

export default function StatsOverview({ stats, showChange = true }: StatsOverviewProps) {
    const statCards = [
        {
            label: 'Attendance Rate',
            value: `${stats.attendanceRate}%`,
            change: showChange ? { value: '+2%', isPositive: true } : undefined,
            color: 'text-blue-600 dark:text-blue-400',
            icon: TrendingUp,
        },
        {
            label: 'Days Present',
            value: stats.daysPresent.toString(),
            color: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Days Absent',
            value: stats.daysAbsent.toString(),
            color: 'text-red-600 dark:text-red-400',
        },
        {
            label: 'Times Late',
            value: stats.timesLate.toString(),
            color: 'text-yellow-600 dark:text-yellow-400',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}