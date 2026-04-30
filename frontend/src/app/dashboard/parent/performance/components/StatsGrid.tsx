"use client"

import { TrendingUp, Trophy, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';

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
    color?: 'orange' | 'green' | 'blue' | 'slate';
}

const StatCard = ({ title, value, subtitle, icon, trend, color = 'orange', link }: StatCardProps) => {
    const colorClasses = {
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/10',
        green: 'text-green-500 bg-green-500/10 border-green-500/10',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/10',
        slate: 'text-slate-500 bg-slate-500/10 border-slate-500/10',
    };

    return (
        <Link href={link || "#"}>
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
                    <div className={`p-2 rounded-xl border ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</span>
                    {trend && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center uppercase tracking-tight ${
                            trend.isPositive ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
                        }`}>
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            {trend.value}
                        </span>
                    )}
                </div>
                <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
            </div>
        </Link>
    );
};

export default function StatsGrid() {
    const { selectedChildId } = useParentStore();
    const { data, isLoading } = useParentDashboard(selectedChildId);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-3xl" />
                ))}
            </div>
        )
    }

    const statsData = data?.stats;
    const avg = statsData?.averageGrade ?? 0;

    const gradeLabel = (avg: number) => {
        if (!data?.child?.recentGrades || data.child.recentGrades.length === 0) return 'N/A'
        if (avg >= 90) return 'A+'
        if (avg >= 80) return 'A'
        if (avg >= 70) return 'B'
        if (avg >= 60) return 'C'
        if (avg >= 50) return 'D'
        return 'F'
    }

    const stats = [
        {
            title: 'Average Score',
            value: `${avg}%`,
            subtitle: avg >= 75 ? 'Above target performance.' : 'Keep focusing on subjects.',
            icon: <TrendingUp size={20} />,
            trend: { value: '2.1%', isPositive: true },
            link: "",
            color: 'blue' as const
        },
        {
            title: 'Academic Level',
            value: gradeLabel(avg),
            subtitle: 'Overall academic standing',
            icon: <Award size={20} />,
            color: 'green' as const,
            link: "/dashboard/parent/performance/subject-performance"
        },
        {
            title: 'Assignments',
            value: data?.child?.recentGrades?.length.toString() || '0',
            subtitle: 'Assessments this term',
            icon: <Trophy size={20} />,
            color: 'orange' as const,
            link: ''
        },
        {
            title: 'Attendance',
            value: `${statsData?.attendanceRate ?? 0}%`,
            subtitle: 'Presence recorded',
            icon: <Clock size={20} />,
            color: 'slate' as const,
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
