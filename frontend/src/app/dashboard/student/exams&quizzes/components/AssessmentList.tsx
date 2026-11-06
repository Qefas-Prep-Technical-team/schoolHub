'use client';

import { useMemo } from 'react';
import { Assessment } from './types';
import AssessmentItem from './AssessmentItem';
import Badge from './ui/Badge';
import { BookOpen, Activity, Clock, ChevronRight, HelpCircle, FileQuestion, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { groupByDate } from '../utils/dateSectioning';
import { getGradeEvaluation, GradingRule } from '@/utils/gradingSystem';

interface AssessmentListProps {
    assessments: Assessment[];
    title?: string;
    viewMode?: 'grid' | 'table';
    gradingSystem?: GradingRule[] | null;
}

export default function AssessmentList({
    assessments,
    title = 'Assessments',
    viewMode = 'grid',
    gradingSystem,
}: AssessmentListProps) {
    const groupedAssessments = useMemo(() => {
        return groupByDate(assessments, (a) => a.startDate || a.createdAt || a.endDate || a.date);
    }, [assessments]);

    if (assessments.length === 0) {
        return (
            <div className="mt-6 bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 mx-auto mb-4">
                    <FileQuestion className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Assessments Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    There are currently no {title.toLowerCase()} published for your class cohort. Please check back later.
                </p>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="mt-6 space-y-8">
                {groupedAssessments.map((group) => (
                    <div key={group.label} className="space-y-4">
                        {/* Section Header with Date Badge */}
                        <div className="flex items-center gap-2.5 px-1">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/30 text-xs font-bold shadow-xs">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{group.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                                ({group.items.length} {group.items.length === 1 ? 'assessment' : 'assessments'})
                            </span>
                            <div className="h-px flex-1 bg-slate-200/60 dark:border-zinc-800/80" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {group.items.map((assessment) => {
                                const scoreNum = assessment.scorePercentage != null
                                    ? assessment.scorePercentage
                                    : assessment.score
                                        ? parseInt(assessment.score.replace('%', ''), 10)
                                        : null;
                                const gradeEval = scoreNum != null && !isNaN(scoreNum)
                                    ? getGradeEvaluation(scoreNum, gradingSystem)
                                    : null;

                                const isLive = assessment.status === 'open' || assessment.status === 'ongoing';
                                const cardHref = assessment.type === 'assignment'
                                    ? `/dashboard/student/exams&quizzes/${assessment.id}`
                                    : isLive
                                        ? `/Exams&Quizzes/exam/${assessment.id}`
                                        : `/dashboard/student/exams&quizzes/${assessment.id}`;

                                return (
                                    <Link
                                        key={assessment.id}
                                        href={cardHref}
                                        className="group flex flex-col justify-between bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:border-pink-500/40 hover:shadow-md transition-all active:scale-[0.99]"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                                                        {assessment.type === 'exam' ? <BookOpen size={18} /> : <Activity size={18} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                                            {assessment.title}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 truncate">
                                                                {assessment.subject}
                                                            </p>
                                                            {assessment.className && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-900/30">
                                                                    {assessment.className}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant={assessment.status} size="sm">
                                                    {assessment.status === 'open' ? 'Live' :
                                                        assessment.status === 'coming soon' ? 'Soon' :
                                                            assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 py-3 my-3 bg-slate-50/60 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-zinc-800/80 text-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Duration</p>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-200 mt-0.5">
                                                        {(assessment.durationMinutes ?? 0) > 0 ? `${assessment.durationMinutes}m` : '-'}
                                                    </p>
                                                </div>
                                                <div className="border-x border-slate-200/60 dark:border-zinc-800/80">
                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Questions</p>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-200 mt-0.5">
                                                        {(assessment.questionsCount ?? 0) > 0 ? `${assessment.questionsCount} Qs` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Score</p>
                                                    {gradeEval ? (
                                                        <div className="flex items-center justify-center gap-1 mt-0.5">
                                                            <span className={`text-xs sm:text-sm font-black ${gradeEval.color}`}>
                                                                {assessment.score || `${scoreNum}%`}
                                                            </span>
                                                            <span className={`inline-flex items-center px-1 py-0.2 rounded text-[9px] font-black uppercase border ${gradeEval.color} ${gradeEval.bg}`}>
                                                                {gradeEval.grade}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs sm:text-sm font-black mt-0.5 text-slate-400 dark:text-zinc-500">
                                                            {assessment.score || '-'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-zinc-800/80">
                                            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                                {assessment.date}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 font-bold text-pink-600 dark:text-pink-400 text-xs group-hover:translate-x-0.5 transition-transform">
                                                {assessment.status === 'ongoing' ? 'Continue Exam' : isLive ? 'Start Exam' : 'View Details'}
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    let globalCounter = 0;

    return (
        <div className="mt-6 space-y-8">
            {groupedAssessments.map((group) => (
                <div key={group.label} className="space-y-3">
                    {/* Section Header with Date Badge */}
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/30 text-xs font-bold shadow-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{group.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                            ({group.items.length} {group.items.length === 1 ? 'record' : 'records'})
                        </span>
                        <div className="h-px flex-1 bg-slate-200/60 dark:border-zinc-800/80" />
                    </div>

                    <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40">
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 w-12 text-center">#</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Assessment</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Schedule</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Duration</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Questions</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Score</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Status</th>
                                        <th className="p-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                    {group.items.map((assessment) => {
                                        globalCounter += 1;
                                        return (
                                            <AssessmentItem
                                                key={assessment.id}
                                                assessment={assessment}
                                                index={globalCounter}
                                                gradingSystem={gradingSystem}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
