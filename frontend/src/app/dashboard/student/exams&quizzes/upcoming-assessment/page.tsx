'use client';

import { useMemo } from 'react';
import PageHeader from './components/PageHeader';
import CountdownCard from './components/CountdownCard';
import AssessmentCard from './components/AssessmentCard';
import { useExams } from '@/lib/api/hooks/useExams';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { groupByDate } from '../utils/dateSectioning';
import { Assessment as AssessmentType } from './components/types';
import { Calendar, ChevronLeft, Loader2, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function UpcomingAssessmentsPage() {
    const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
    const { user } = useAuthStore();
    const userRecord = user as Record<string, unknown> | null | undefined;
    const schoolId =
        studentProfile?.schoolId ||
        user?.schools?.[0]?.schoolId ||
        (typeof userRecord?.schoolId === 'string' ? userRecord.schoolId : '') ||
        user?.tenantId ||
        '';
    const { data: schoolProfile } = useSchoolProfile(schoolId);

    const { data: examsData = [], isLoading: isExamsLoading } = useExams({ status: 'PUBLISHED' });
    const { data: assignmentsResponse, isLoading: isAssignmentsLoading } = useStudentAssignments({ limit: 100 });

    const isLoading = isProfileLoading || isExamsLoading || isAssignmentsLoading;

    // Normalizing upcoming items
    const upcomingItems = useMemo(() => {
        const now = new Date();
        const exams = (examsData as any[]) || [];
        const rawAssignments = (assignmentsResponse?.assignments as any[]) || [];

        const mappedExams: (AssessmentType & { rawDate?: Date })[] = exams
            .map((exam: any) => {
                const start = exam.startDate ? new Date(exam.startDate) : null;
                const end = exam.endDate ? new Date(exam.endDate) : null;
                const attempt = exam.examAttempts?.[0] || exam.attempts?.[0];

                // Include if not submitted and either upcoming or live
                const isUpcoming = (start && now < start) || (!attempt || attempt.status === 'IN_PROGRESS');
                const isEnded = end && now > end;

                if (isEnded || (attempt && (attempt.status === 'SUBMITTED' || attempt.status === 'SCORED'))) {
                    return null;
                }

                const cat = (exam.category || 'exam').toLowerCase();
                const type: 'exam' | 'quiz' | 'submission' = cat === 'quiz' ? 'quiz' : 'exam';

                return {
                    id: exam.id,
                    title: exam.title,
                    type,
                    date: start ? start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
                    time: start ? start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Flexible',
                    duration: (exam.durationMinutes ?? 0) > 0 ? `${exam.durationMinutes} minutes` : '60 minutes',
                    format: 'CBT' as const,
                    subject: exam.subject?.name || 'General Assessment',
                    rawDate: start || undefined,
                };
            })
            .filter(Boolean) as (AssessmentType & { rawDate?: Date })[];

        const mappedAssignments: (AssessmentType & { rawDate?: Date })[] = rawAssignments
            .map((assignment: any) => {
                const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                if (assignment.status === 'submitted' || assignment.status === 'graded') return null;

                return {
                    id: assignment.id,
                    title: assignment.title,
                    type: 'submission' as const,
                    date: dueDate ? dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
                    time: dueDate ? dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '11:59 PM',
                    duration: 'Take Home',
                    format: 'Written' as const,
                    subject: assignment.subject || 'Coursework',
                    rawDate: dueDate || (assignment.createdAt ? new Date(assignment.createdAt) : undefined),
                };
            })
            .filter(Boolean) as (AssessmentType & { rawDate?: Date })[];

        return [...mappedExams, ...mappedAssignments];
    }, [examsData, assignmentsResponse]);

    // Chronological date sectioning using skill helper
    const groupedUpcoming = useMemo(() => {
        return groupByDate(upcomingItems, (item) => item.rawDate || item.date);
    }, [upcomingItems]);

    // Top featured next-up assessment
    const featuredItem = upcomingItems[0];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading upcoming assessments...</p>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col font-sans pb-16">
            <div className="flex h-full w-full grow">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-4xl space-y-8">
                        <div className="flex items-center justify-between gap-3">
                            <Link 
                                href="/dashboard/student/exams&quizzes"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-pink-600 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back to Assessments Hub</span>
                            </Link>
                        </div>

                        <PageHeader />

                        {featuredItem && (
                            <CountdownCard
                                title={featuredItem.title}
                                date={`${featuredItem.date} at ${featuredItem.time}`}
                                subject={featuredItem.subject}
                                image="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80"
                                initialCountdown={{ days: 1, hours: 4, minutes: 20, seconds: 0 }}
                            />
                        )}

                        {groupedUpcoming.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-500">
                                <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                                <p className="font-bold text-slate-800 dark:text-zinc-200 text-sm">No Upcoming Assessments</p>
                                <p className="text-xs text-slate-400 mt-1">You are all caught up with your upcoming examinations and tests.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {groupedUpcoming.map((group) => (
                                    <div key={group.label} className="space-y-4">
                                        <div className="flex items-center gap-2.5 px-1 border-b border-gray-200 dark:border-gray-800 pb-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/30 text-xs font-bold shadow-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{group.label}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                                                ({group.items.length} scheduled)
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {group.items.map((assessment) => (
                                                <AssessmentCard key={assessment.id} assessment={assessment} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
