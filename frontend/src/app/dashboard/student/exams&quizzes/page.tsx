'use client';

import { useState, useMemo } from 'react';
import PageHeader from './components/PageHeader';
import AssessmentTypeToggle from './components/AssessmentTypeToggle';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import TimeFilter from './components/TimeFilter';
import AssessmentList from './components/AssessmentList';
import { useExams } from '@/lib/api/hooks/useExams';
import { Assessment } from './components/types';
import { 
    statCards, 
    timeFilters 
} from './components/data';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const [assessmentType, setAssessmentType] = useState<'exams' | 'quizzes'>('exams');
    const [timeFilter, setTimeFilter] = useState('term');

    // Fetch all published assessments
    const { data: assessments = [], isLoading, isError } = useExams({ status: 'PUBLISHED' });

    // Map Backend Assessments to Frontend interface
    const allAssessments: Assessment[] = useMemo(() => {
        const now = new Date();
        return assessments.map((item: any) => {
            const startDate = item.startDate ? new Date(item.startDate) : null;
            const attempt = item.attempts?.[0];

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
                score: (item.allowImmediateResult || (item.resultReleaseAt && new Date() >= new Date(item.resultReleaseAt))) 
                    ? (attempt?.score != null ? `${attempt.score}%` : null) 
                    : null,
                status,
                type: item.category?.toLowerCase() === 'quiz' ? 'quiz' : 'exam',
                durationMinutes: item.durationMinutes
            };
        });
    }, [assessments]);

    // Filter assessments by type
    const filteredAssessments = useMemo(() => {
        return allAssessments.filter(assessment =>
            assessmentType === 'exams' ? assessment.type === 'exam' : assessment.type === 'quiz'
        );
    }, [allAssessments, assessmentType]);

    if (isLoading) {
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
                            <StatsCards cards={statCards} />
                        </div>
                        <PerformanceChart />
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