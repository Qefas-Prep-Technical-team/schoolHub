import { BarChart3, Book, Trophy, AlertTriangle } from 'lucide-react';
import StatCard from './ui/StatCard';

export default function StatsOverview() {
    const stats = [
        {
            title: 'Overall Average',
            value: '88%',
            change: '+2%',
            changePositive: true,
            subtitle: 'vs. last term',
            icon: BarChart3,
            iconColor: 'text-primary',
        },
        {
            title: 'Total Subjects',
            value: '8',
            subtitle: 'Active enrollments',
            icon: Book,
            iconColor: 'text-purple-500',
        },
        {
            title: 'Top Subject',
            value: 'Mathematics',
            subtitle: '98% Score',
            subtitleColor: 'text-green-600 dark:text-green-400',
            icon: Trophy,
            iconColor: 'text-green-500',
        },
        {
            title: 'Needs Focus',
            value: 'Science',
            subtitle: '72% Score',
            subtitleColor: 'text-orange-500 dark:text-orange-400',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}