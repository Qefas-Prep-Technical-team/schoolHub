'use client';

import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { School, ChevronLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import SubjectPerformanceList from '../components/SubjectPerformanceList';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';

export default function PerformancePage() {
    const { selectedChildId, setSelectedChildId } = useParentStore();
    const { data: student } = useChildExams(selectedChildId);
    const { data: children = [] } = useParentChildren();

    const studentName = student?.name || 'Student';
    const className = student?.classes?.[0]?.class?.name || 'Class';

    return (
        <div className="flex-1 flex flex-col relative overflow-y-auto bg-background-light dark:bg-background-dark">
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
                {/* Back button */}
                <Link
                    href="/dashboard/parent/performance"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors self-start"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Performance Overview
                </Link>

                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                Subject Performance
                            </h1>
                            <HeaderTooltip
                                content="Comprehensive analysis of your child's performance in each registered subject. Use this view to compare individual subject averages, identify learning gaps, and verify that all curriculum requirements are on track."
                            />
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            <School className="h-4 w-4 text-orange-600" />
                            <span>
                                Enrolled curriculum analysis for{' '}
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {studentName} ({className})
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Child Switcher (if multiple children exist) */}
                    {children.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Child:</span>
                            {children.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedChildId(c.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                                        selectedChildId === c.id
                                            ? "bg-orange-600 text-white shadow-sm"
                                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Full Subject Performance Breakdown (Grid / List view with numbering) */}
                <div className="pt-2">
                    <SubjectPerformanceList />
                </div>
            </main>
        </div>
    );
}
