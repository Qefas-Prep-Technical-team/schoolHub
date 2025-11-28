import { Users, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        totalStudents: number;
        averageGrade: string;
        passingStudents: number;
        failingStudents: number;
    };
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const statItems = [
        {
            icon: Users,
            label: 'Total Students',
            value: stats.totalStudents.toLocaleString(),
            bgColor: 'bg-primary/10 dark:bg-primary/20',
            textColor: 'text-primary dark:text-blue-300',
            iconColor: 'text-primary dark:text-blue-300'
        },
        {
            icon: TrendingUp,
            label: 'Average Grade',
            value: stats.averageGrade,
            bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20',
            textColor: 'text-yellow-600 dark:text-yellow-400',
            iconColor: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            icon: ThumbsUp,
            label: 'Passing Students',
            value: stats.passingStudents.toLocaleString(),
            bgColor: 'bg-green-500/10 dark:bg-green-500/20',
            textColor: 'text-green-600 dark:text-green-400',
            iconColor: 'text-green-600 dark:text-green-400'
        },
        {
            icon: ThumbsDown,
            label: 'Failing Students',
            value: stats.failingStudents.toLocaleString(),
            bgColor: 'bg-red-500/10 dark:bg-red-500/20',
            textColor: 'text-red-600 dark:text-red-400',
            iconColor: 'text-red-600 dark:text-red-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statItems.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1C1C2D] border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center size-10 rounded-full ${stat.bgColor}`}>
                                <Icon className={stat.iconColor} size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {stat.label}
                            </p>
                        </div>
                        <p className={`text-3xl font-bold ${stat.textColor}`}>
                            {stat.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}