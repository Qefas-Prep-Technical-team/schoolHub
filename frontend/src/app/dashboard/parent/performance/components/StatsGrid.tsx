import { TrendingUp, Trophy, Award, Clock } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    link: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'info';
}

const StatCard = ({ title, value, subtitle, icon, trend, color = 'primary', link }: StatCardProps) => {
    const colorClasses = {
        primary: 'text-primary/60',
        success: 'text-success/60',
        warning: 'text-orange-400/80',
        info: 'text-blue-400/60',
    };

    return (
        <Link
            href={link}
        >


            <div className="bg-surface-light dark:bg-surface-dark p-6 cursor-pointer rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-text-secondary dark:text-text-secondary-dark font-medium">{title}</p>
                    <div className={colorClasses[color]}>
                        {icon}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-main dark:text-white">{value}</span>
                    {trend && (
                        <span className={`text-sm font-bold ${trend.isPositive ? 'text-success' : 'text-danger'
                            } bg-success/10 px-2 py-0.5 rounded-full flex items-center`}>
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            {trend.value}
                        </span>
                    )}
                </div>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">{subtitle}</p>
            </div>
        </Link>
    );
};

export default function StatsGrid() {
    const stats = [
        {
            title: 'Average Score',
            value: '87%',
            subtitle: 'Overall performance is rising.',
            icon: <TrendingUp className="h-6 w-6" />,
            trend: { value: '2.5%', isPositive: true },
            link: ""
        },
        {
            title: 'Class Position',
            value: '4th',
            subtitle: 'Top 15% of class',
            icon: <Trophy className="h-6 w-6" />,
            color: 'info' as const,
            link: ''
        },
        {
            title: 'Overall Grade',
            value: 'A',
            subtitle: 'Consistent across subjects',
            icon: <Award className="h-6 w-6" />,
            color: 'success' as const,
            link: "/dashboard/parent/performance/subject-performance"
        },
        {
            title: 'Attendance',
            value: '95%',
            subtitle: 'High attendance record',
            icon: <Clock className="h-6 w-6" />,
            color: 'warning' as const,
            link: ""
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (

                <StatCard key={index} {...stat} />

            ))}
        </div>
    );
}