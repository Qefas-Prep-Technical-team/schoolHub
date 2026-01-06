import { School, GraduationCap, Users, UserMinus, TrendingUp, TrendingDown } from 'lucide-react';
import KPICard from './ui/KPICard';

export default function KPICards() {
    const stats = [
        {
            id: 'student-presence',
            title: 'Student Presence',
            value: '94%',
            icon: School,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            trend: { value: '+2.1%', isPositive: true },
            progress: 94,
            progressColor: 'bg-green-500',
            showProgress: true,
            link: {
                label: 'View Details',
                href: '#',
            },
        },
        {
            id: 'teacher-presence',
            title: 'Teacher Presence',
            value: '88%',
            icon: GraduationCap,
            iconColor: 'text-orange-600 dark:text-orange-400',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            trend: { value: '-5.4%', isPositive: false },
            progress: 88,
            progressColor: 'bg-orange-500',
            showProgress: true,
            warning: true,
            link: {
                label: 'Investigate',
                href: '#',
            },
        },
        {
            id: 'student-absentees',
            title: 'Student Absentees',
            value: '42',
            subtitle: 'Total',
            icon: Users,
            iconColor: 'text-primary',
            iconBg: 'bg-blue-50 dark:bg-blue-900/30',
            showProgress: false,
            link: {
                label: 'View List',
                href: '#',
            },
        },
        {
            id: 'teacher-absentees',
            title: 'Teacher Absentees',
            value: '6',
            subtitle: 'Total',
            icon: UserMinus,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50 dark:bg-red-900/30',
            showProgress: false,
            link: {
                label: 'View List',
                href: '#',
            },
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <KPICard key={stat.id} {...stat} />
            ))}
        </div>
    );
}