'use client';

import { useState, useMemo } from 'react';
import PageHeader from './components/PageHeader';
import AssessmentTypeToggle from './components/AssessmentTypeToggle';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import TimeFilter from './components/TimeFilter';
import AssessmentList from './components/AssessmentList';
import { useExams, useStudentStats } from '@/lib/api/hooks/useExams';
import { Assessment, StatCard } from './components/types';
import { 
    timeFilters 
} from './components/data';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const [assessmentType, setAssessmentType] = useState<'exams' | 'quizzes'>('exams');
    const [timeFilter, setTimeFilter] = useState('term');

    // Fetch student stats and published assessments
    const { data: statsData, isLoading: isStatsLoading } = useStudentStats();
    const { data: assessments = [], isLoading: isExamsLoading, isError } = useExams({ status: 'PUBLISHED' });

    // Map Backend Assessments to Frontend interface
    const allAssessments: Assessment[] = useMemo(() => {
        const now = new Date();
        return assessments.map((item: any) => {
            const startDate = item.startDate ? new Date(item.startDate) : null;
            const endDate = item.endDate ? new Date(item.endDate) : null;
            const attempt = item.attempts?.[0];
            const questionsCount = item.subjectPapers?.reduce((acc: number, paper: any) => acc + (paper.questions?.length || 0), 0) || 0;
            const durationMinutes = item.durationMinutes > 0 
                ? item.durationMinutes 
                : item.subjectPapers?.reduce((acc: number, paper: any) => acc + (paper.durationMinutes || 0), 0) || 0;

            let status: Assessment['status'] = 'active';
            if (startDate && now < startDate) {
                status = 'upcoming';
            } else if (attempt) {
                if (attempt.status === 'IN_PROGRESS') {
                    status = 'ongoing';
                } else if (attempt.status === 'SUBMITTED' || attempt.status === 'SCORED') {
                    status = 'taken';
                }
            }

            return {
                id: item.id,
                title: item.title,
                subject: item.subjectPapers?.[0]?.subject?.name || 'Multiple Subjects',
                date: item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'TBD',
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                score: (item.allowImmediateResult || (item.resultReleaseAt && now >= new Date(item.resultReleaseAt))) 
                    ? (attempt?.totalScore != null ? `${Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100)}%` : null) 
                    : null,
                status,
                type: item.category?.toLowerCase() === 'quiz' ? 'quiz' : 'exam',
                durationMinutes,
                questionsCount,
            };
        });
    }, [assessments]);

    // Construct Dynamic Stats Cards
    const dynamicStatCards: StatCard[] = useMemo(() => {
        if (!statsData) return [
            { label: "Upcoming", value: "0", icon: "event_upcoming", link: "upcoming-assessment" },
            { label: "Completed", value: "0", icon: "task_alt", link: "completed" },
            { label: "Average Score", value: "0%", icon: "monitoring", link: "average-score" },
            { label: "Class Position", value: "N/A", icon: "emoji_events", link: "class-position" },
        ];

        const getOrdinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        return [
            {
                label: "Upcoming",
                value: statsData.upcomingCount.toString(),
                icon: "event_upcoming",
                link: "upcoming-assessment",
            },
            {
                label: "Completed",
                value: statsData.completedCount.toString(),
                icon: "task_alt",
                link: "completed",
            },
            {
                label: "Average Score",
                value: `${statsData.averageScore}%`,
                icon: "monitoring",
                link: "average-score",
                trend: statsData.trend,
            },
            {
                label: "Class Position",
                value: statsData.overallRank > 0 ? getOrdinal(statsData.overallRank) : 'N/A',
                icon: "emoji_events",
                link: "class-position",
            },
        ];
    }, [statsData]);

    // Filter assessments by type
    const filteredAssessments = useMemo(() => {
        return allAssessments.filter(assessment =>
            assessmentType === 'exams' ? assessment.type === 'exam' : assessment.type === 'quiz'
        );
    }, [allAssessments, assessmentType]);

    if (isExamsLoading || isStatsLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
                <p className="text-xl font-bold text-red-500">Failed to load assessments</p>
                <p className="text-slate-500">Please check your connection and try again.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-6 lg:p-8">
                <div className="mx-auto max-max-w-7xl">
                    <PageHeader />
                    <AssessmentTypeToggle onTypeChange={setAssessmentType} />

                    {/* Stats & Performance Grid */}
                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <StatsCards cards={dynamicStatCards} />
                        </div>
                        <PerformanceChart stats={statsData} />
                    </div>

                    {/* Assessments List */}
                    <TimeFilter
                        filters={timeFilters}
                        activeFilter={timeFilter}
                        onFilterChange={setTimeFilter}
                        title={`Upcoming ${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}`}
                    />

                    <AssessmentList assessments={filteredAssessments} />
                </div>
            </main>
        </div>
    );
}
