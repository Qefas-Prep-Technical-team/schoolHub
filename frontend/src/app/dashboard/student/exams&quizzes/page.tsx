'use client';

import { useState, useMemo } from 'react';
import PageHeader from './components/PageHeader';
import AssessmentTypeToggle from './components/AssessmentTypeToggle';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import TimeFilter from './components/TimeFilter';
import AssessmentList from './components/AssessmentList';
import { useExams, useStudentStats } from '@/lib/api/hooks/useExams';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { Assessment, StatCard } from './components/types';
import { 
    timeFilters 
} from './components/data';
import { Loader2 } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function Home() {
    const [assessmentType, setAssessmentType] = useState<'exams' | 'quizzes' | 'ca' | 'assignment'>('exams');
    const [timeFilter, setTimeFilter] = useState('term');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch student stats and published assessments
    const { data: statsData, isLoading: isStatsLoading } = useStudentStats();
    const { data: examsData = [], isLoading: isExamsLoading, isError: isExamsError } = useExams({ status: 'PUBLISHED' });
    const { data: assignmentsResponse, isLoading: isAssignmentsLoading, isError: isAssignmentsError } = useStudentAssignments({ limit: 100 });
    
    const isError = isExamsError || isAssignmentsError;
    const isLoading = isExamsLoading || isAssignmentsLoading || isStatsLoading;
    
    // Normalize and combine assessments and assignments
    const assessments = useMemo(() => {
        const assignmentsData = assignmentsResponse?.assignments || [];
        return [...examsData, ...assignmentsData];
    }, [examsData, assignmentsResponse]);

    // Map Backend Assessments and Assignments to Frontend interface
    const allAssessments: Assessment[] = useMemo(() => {
        const now = new Date();
        return assessments.map((item: any) => {
            // Assignments have 'questionCount' field; exams have 'category'. Use this as the discriminator.
            const isAssignment = 'questionCount' in item && !('category' in item);

            if (isAssignment) {
                const dueDate = item.dueDate ? new Date(item.dueDate) : null;
                
                let status: Assessment['status'] = 'active';
                if (item.status === 'overdue') status = 'missed';
                else if (item.status === 'submitted' || item.status === 'graded') status = 'taken';
                else if (item.status === 'in_progress') status = 'ongoing';
                else if (dueDate && now < dueDate) status = 'active';

                return {
                    id: item.id,
                    title: item.title,
                    subject: item.subject || 'Multiple Subjects',
                    date: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'TBD',
                    startDate: item.createdAt ? new Date(item.createdAt) : undefined,
                    endDate: dueDate || undefined,
                    score: item.grade || null,
                    status,
                    type: 'assignment',
                    durationMinutes: 0, // Assignments typically don't have a strict timer in this context
                    questionsCount: item.questionCount || 0,
                };
            }

            // Otherwise, it's an Exam/Quiz/CA
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
                type: item.category?.toLowerCase() === 'quiz' ? 'quiz' : item.category?.toLowerCase() === 'ca' ? 'ca' : 'exam',
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
            assessmentType === 'exams' ? assessment.type === 'exam' 
            : assessmentType === 'quizzes' ? assessment.type === 'quiz'
            : assessmentType === 'ca' ? assessment.type === 'ca'
            : assessment.type === 'assignment'
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
                <div className="mx-auto max-w-7xl">
                    <PageHeader />
                    <AssessmentTypeToggle onTypeChange={(type) => {
                        setAssessmentType(type);
                        setCurrentPage(1);
                    }} />

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
                        title={`Upcoming ${assessmentType === 'ca' ? 'CA' : assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}`}
                    />

                    <AssessmentList assessments={filteredAssessments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} />
                    {filteredAssessments.length > 0 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredAssessments.length / itemsPerPage)}
                                totalItems={filteredAssessments.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
