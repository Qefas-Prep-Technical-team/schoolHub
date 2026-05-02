import { School, GraduationCap, Users, UserMinus } from 'lucide-react';
import KPICard from './ui/KPICard';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardsProps {
    stats?: {
        students: number;
        teachers: number;
        classes: number;
        exams: number;
        subjects: number;
    };
    isLoading?: boolean;
}

export default function KPICards({ stats, isLoading }: KPICardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            id: 'student-presence',
            title: 'Student Presence',
            value: '94%',
            icon: School,
            iconColor: 'text-primary dark:text-primary',
            iconBg: 'bg-primary/10',
            trend: { value: '+2.1%', isPositive: true },
            progress: 94,
            progressColor: 'bg-primary',
            showProgress: true,
            link: {
                label: 'View Class Analytics',
                href: '#',
            },
        },
        {
            id: 'teacher-presence',
            title: 'Teacher Presence',
            value: '88%',
            icon: GraduationCap,
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-500/10',
            trend: { value: '-5.4%', isPositive: false },
            progress: 88,
            progressColor: 'bg-emerald-500',
            showProgress: true,
            warning: true,
            link: {
                label: 'Investigate Faculty',
                href: '#',
            },
        },
        {
            id: 'student-absentees',
            title: 'Daily Absentees',
            value: stats ? Math.round(stats.students * 0.06).toString() : '42',
            subtitle: 'Students Expected',
            icon: Users,
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-500/10',
            showProgress: false,
            link: {
                label: 'Export List',
                href: '#',
            },
        },
        {
            id: 'teacher-absentees',
            title: 'Unexcused Absence',
            value: stats ? Math.round(stats.teachers * 0.12).toString() : '6',
            subtitle: 'Staff Personnel',
            icon: UserMinus,
            iconColor: 'text-rose-600 dark:text-rose-400',
            iconBg: 'bg-rose-500/10',
            showProgress: false,
            link: {
                label: 'View Disciplinary',
                href: '#',
            },
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat) => (
                <KPICard key={stat.id} {...stat} />
            ))}
        </div>
    );
}

