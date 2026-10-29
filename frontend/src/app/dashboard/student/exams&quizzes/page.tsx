'use client';

import { useState, useMemo, useEffect } from 'react';
import PageHeader from './components/PageHeader';
import AssessmentTypeToggle from './components/AssessmentTypeToggle';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import TimeFilter from './components/TimeFilter';
import AssessmentList from './components/AssessmentList';
import { useExams, useStudentStats } from '@/lib/api/hooks/useExams';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { Assessment, StatCard } from './components/types';
import { timeFilters } from './components/data';
import { Loader2, Search, X, LayoutGrid, List, GraduationCap, ChevronDown } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface RawSubjectPaper {
  durationMinutes?: number;
  questions?: unknown[];
  subject?: {
    name?: string;
  };
}

interface RawAttempt {
  status?: string;
  totalScore?: number;
  totalMarks?: number;
}

interface RawExamItem {
  id: string;
  title: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  durationMinutes?: number;
  resultReleaseAt?: string;
  allowImmediateResult?: boolean;
  classId?: string;
  class?: { id: string; name: string; section?: string };
  subjectPapers?: RawSubjectPaper[];
  attempts?: RawAttempt[];
}

interface RawAssignmentItem {
  id: string;
  title: string;
  subject?: string;
  classId?: string;
  dueDate?: string;
  createdAt?: string;
  grade?: string;
  status?: string;
  questionCount?: number;
}

export default function StudentAssessmentsPage() {
    const [assessmentType, setAssessmentType] = useState<'exams' | 'quizzes' | 'ca' | 'assignment'>('exams');
    const [timeFilter, setTimeFilter] = useState('term');
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const itemsPerPage = 10;

    // Detect small screens and prefer grid view by default on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setViewMode('grid');
        }
    }, []);

    // Fetch student profile to get connected classes
    const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
    const studentClasses = useMemo(() => {
        return (studentProfile?.classes || [])
            .map((c) => c.class)
            .filter((cls): cls is { id: string; name: string; section?: string } => Boolean(cls && cls.id));
    }, [studentProfile]);

    // Construct query filters considering class selection
    const examsQueryFilters = useMemo(() => {
        const filters: Record<string, unknown> = { status: 'PUBLISHED' };
        if (selectedClassId !== 'all') {
            filters.classId = selectedClassId;
        }
        return filters;
    }, [selectedClassId]);

    // Fetch student stats and published assessments
    const { data: statsData, isLoading: isStatsLoading } = useStudentStats();
    const { data: examsData = [], isLoading: isExamsLoading, isError: isExamsError } = useExams(examsQueryFilters);
    const { data: assignmentsResponse, isLoading: isAssignmentsLoading, isError: isAssignmentsError } = useStudentAssignments({ limit: 100 });
    
    const isError = isExamsError || isAssignmentsError;
    const isLoading = isExamsLoading || isAssignmentsLoading || isStatsLoading || isProfileLoading;
    
    // Normalize and combine assessments and assignments
    const assessments = useMemo(() => {
        const assignmentsData = (assignmentsResponse?.assignments as unknown as RawAssignmentItem[]) || [];
        const exams = (examsData as unknown as RawExamItem[]) || [];
        return [...exams, ...assignmentsData];
    }, [examsData, assignmentsResponse]);

    // Map Backend Assessments and Assignments to Frontend interface
    const allAssessments: Assessment[] = useMemo(() => {
        const now = new Date();
        return assessments.map((item) => {
            // Assignments have 'questionCount' field and lack 'category'
            const isAssignment = 'questionCount' in item && !('category' in item);

            if (isAssignment) {
                const assignment = item as RawAssignmentItem;
                const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                const matchedClass = studentClasses.find(c => c.id === assignment.classId);
                
                let status: Assessment['status'] = 'open';
                if (assignment.status === 'overdue') status = 'missing';
                else if (assignment.status === 'submitted' || assignment.status === 'graded') status = 'submitted';
                else if (assignment.status === 'in_progress') status = 'ongoing';
                else if (assignment.createdAt && now < new Date(assignment.createdAt)) status = 'coming soon';
                else if (dueDate && now > dueDate) status = 'closed';
                else status = 'open';

                return {
                    id: assignment.id,
                    title: assignment.title,
                    subject: assignment.subject || 'Multiple Subjects',
                    date: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'TBD',
                    startDate: assignment.createdAt ? new Date(assignment.createdAt) : undefined,
                    endDate: dueDate || undefined,
                    score: assignment.grade || null,
                    status,
                    type: 'assignment',
                    durationMinutes: 0,
                    questionsCount: assignment.questionCount || 0,
                    classId: assignment.classId,
                    className: matchedClass?.name,
                };
            }

            // Otherwise, it's an Exam/Quiz/CA
            const exam = item as RawExamItem;
            const startDate = exam.startDate ? new Date(exam.startDate) : null;
            const endDate = exam.endDate ? new Date(exam.endDate) : null;
            const attempt = exam.attempts?.[0];
            const questionsCount = exam.subjectPapers?.reduce((acc: number, paper) => acc + (paper.questions?.length || 0), 0) || 0;
            const durationMinutes = (exam.durationMinutes ?? 0) > 0 
                ? (exam.durationMinutes ?? 0) 
                : exam.subjectPapers?.reduce((acc: number, paper) => acc + (paper.durationMinutes || 0), 0) || 0;
            const matchedClass = exam.class?.name || (exam.classId ? studentClasses.find(c => c.id === exam.classId)?.name : undefined);

            let status: Assessment['status'] = 'open';
            if (startDate && now < startDate) {
                status = 'coming soon';
            } else if (endDate && now > endDate) {
                status = 'closed';
            }
            if (attempt) {
                if (attempt.status === 'IN_PROGRESS') {
                    status = 'ongoing';
                } else if (attempt.status === 'SUBMITTED' || attempt.status === 'SCORED') {
                    status = 'submitted';
                }
            }

            return {
                id: exam.id,
                title: exam.title,
                subject: exam.subjectPapers?.[0]?.subject?.name || 'Multiple Subjects',
                date: exam.startDate ? new Date(exam.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'TBD',
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                score: (exam.allowImmediateResult || (exam.resultReleaseAt && now >= new Date(exam.resultReleaseAt))) 
                    ? (attempt?.totalScore != null ? `${Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100)}%` : null) 
                    : null,
                status,
                type: exam.category?.toLowerCase() === 'quiz' ? 'quiz' : exam.category?.toLowerCase() === 'ca' ? 'ca' : 'exam',
                durationMinutes,
                questionsCount,
                classId: exam.classId,
                className: matchedClass,
            };
        });
    }, [assessments, studentClasses]);

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

    // Filter assessments by type, search query, and selected class
    const filteredAssessments = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return allAssessments.filter(assessment => {
            const matchesType = assessmentType === 'exams' ? assessment.type === 'exam' 
                : assessmentType === 'quizzes' ? assessment.type === 'quiz'
                : assessmentType === 'ca' ? assessment.type === 'ca'
                : assessment.type === 'assignment';

            if (!matchesType) return false;
            
            // If a specific class cohort is selected, filter assessments connected to classes
            if (selectedClassId !== 'all' && assessment.classId && assessment.classId !== selectedClassId) {
                return false;
            }

            if (!q) return true;
            return assessment.title.toLowerCase().includes(q) || 
                   assessment.subject.toLowerCase().includes(q) ||
                   (assessment.className && assessment.className.toLowerCase().includes(q));
        });
    }, [allAssessments, assessmentType, searchQuery, selectedClassId]);

    if (isLoading) {
        return (
            <div className="w-full space-y-6 sm:space-y-8 animate-pulse font-sans">
                <div className="h-20 w-1/2 rounded-2xl bg-slate-200 dark:bg-zinc-900" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
                    ))}
                </div>
                <div className="h-64 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-xl font-bold text-rose-500">Failed to load assessments</p>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Please check your network connection and try again.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6">
            <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
                <PageHeader />

                {/* Stats & Performance Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <StatsCards cards={dynamicStatCards} />
                    </div>
                    <PerformanceChart stats={statsData} />
                </div>

                {/* Assessment Type, Search, Class Filter, and Time Filter Toolbar */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">
                            Available Assessments
                        </h2>
                        <HeaderTooltip content="Select an assessment category to view current schedules, question count, and your score reports." />
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <AssessmentTypeToggle onTypeChange={(type) => {
                            setAssessmentType(type);
                            setCurrentPage(1);
                        }} />
                        
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 md:flex-none justify-between md:justify-end">
                            {/* Class Cohort Filter */}
                            {studentClasses.length > 0 && (
                                <div className="relative shrink-0">
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => {
                                            setSelectedClassId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Filter by connected class cohort"
                                        className="h-10 pl-8 pr-7 text-xs font-bold rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer appearance-none hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                                    >
                                        <option value="all">
                                            {studentClasses.length > 1 ? "All My Classes" : `Class: ${studentClasses[0].name}`}
                                        </option>
                                        {studentClasses.length > 1 && studentClasses.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name} {cls.section ? `(${cls.section})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <GraduationCap className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            )}

                            {/* Search input */}
                            <div className="relative flex-1 sm:w-60 min-w-[160px]">
                                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search title or subject..."
                                    className="pl-9 pr-8 h-10 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs shadow-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <TimeFilter
                                filters={timeFilters}
                                activeFilter={timeFilter}
                                onFilterChange={setTimeFilter}
                            />

                            {/* View Mode Toggle */}
                            <div className="flex items-center p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    type="button"
                                    className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                                        viewMode === 'grid'
                                            ? 'bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                                    }`}
                                    title="Grid View"
                                    aria-label="Grid View"
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    type="button"
                                    className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                                        viewMode === 'table'
                                            ? 'bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                                    }`}
                                    title="Table View"
                                    aria-label="Table View"
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assessment List (Grid or Table View) */}
                <AssessmentList 
                    assessments={filteredAssessments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
                    viewMode={viewMode}
                />
                
                {filteredAssessments.length > itemsPerPage && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filteredAssessments.length / itemsPerPage)}
                            totalItems={filteredAssessments.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            theme="pink"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
