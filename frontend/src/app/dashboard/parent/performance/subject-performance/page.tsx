'use client';

import { useState } from 'react';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { School, ChevronLeft, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import SubjectPerformanceList from '../components/SubjectPerformanceList';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { generatePDF } from '@/utils/pdfGenerator';
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck';
import { getGradeEvaluation } from '@/utils/gradingSystem';
import {
  ParentSubjectPerformanceExportModal,
  SubjectPerformanceItem,
} from './components/ParentSubjectPerformanceExportModal';

function getGradeLetter(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function getPerformanceTier(score: number): string {
  if (score >= 80) return 'Mastery';
  if (score >= 70) return 'Proficient';
  if (score >= 60) return 'Developing';
  return 'Needs Support';
}

export default function PerformancePage() {
    const { selectedChildId, setSelectedChildId } = useParentStore();
    const { data: student } = useChildExams(selectedChildId);
    const { data: children = [] } = useParentChildren();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const studentName = student?.name || 'Student';
    const studentCode = student?.id ? student.id.slice(-6).toUpperCase() : 'N/A';
    const className = student?.classes?.[0]?.class?.name || 'Class';
    const deptName = student?.department?.name || 'Curriculum';

    // Build subject list synchronized with school grading system
    const customGradingSystem = (student?.school as { gradingSystem?: unknown[] } | undefined)?.gradingSystem;

    const subjectPerformanceList: SubjectPerformanceItem[] = (() => {
        if (!student) return [];
        const deptSubjects = student.department?.subjects || [];
        const grades = student.grades || [];

        const subjectsMap = new Map<string, {
            name: string;
            teacher: string;
            totalScore: number;
            totalMaxMarks: number;
            count: number;
        }>();

        if (deptSubjects.length > 0) {
            for (const ds of deptSubjects) {
                if (ds.subject?.name) {
                    subjectsMap.set(ds.subject.name.toLowerCase(), {
                        name: ds.subject.name,
                        teacher: 'Department Instructor',
                        totalScore: 0,
                        totalMaxMarks: 0,
                        count: 0
                    });
                }
            }
        }

        for (const g of grades) {
            const subName = g.subject || g.subjectPaper?.subject?.name;
            if (!subName) continue;
            const key = subName.toLowerCase();

            if (deptSubjects.length > 0 && !subjectsMap.has(key)) continue;

            const existing = subjectsMap.get(key) || {
                name: subName,
                teacher: g.subjectPaper?.teacher?.name || 'Class Teacher',
                totalScore: 0,
                totalMaxMarks: 0,
                count: 0
            };

            if (g.subjectPaper?.teacher?.name) existing.teacher = g.subjectPaper.teacher.name;
            existing.totalScore += Number(g.score || 0);
            existing.totalMaxMarks += Number(g.maxMarks || 100);
            existing.count += 1;
            subjectsMap.set(key, existing);
        }

        return Array.from(subjectsMap.values()).map((s) => {
            const avg = s.totalMaxMarks > 0 
                ? Math.round((s.totalScore / s.totalMaxMarks) * 100) 
                : (s.count > 0 ? Math.round(s.totalScore / s.count) : 0);
            const evalResult = getGradeEvaluation(avg, customGradingSystem);
            const grade = s.count > 0 ? evalResult.grade : 'N/A';
            const tier = s.count > 0 ? (evalResult.remark || getPerformanceTier(avg)) : 'Pending Evaluation';

            return {
                name: s.name,
                teacher: s.teacher,
                average: avg,
                grade,
                tier,
                assessmentsCount: s.count,
            };
        });
    })();

    const handleExportReport = () => {
        setIsExportModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-y-auto bg-background-light dark:bg-background-dark">
            <main className="p-3 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-5 sm:gap-6">
                {/* Back button */}
                <Link
                    href="/dashboard/parent/performance"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors self-start"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Performance Overview
                </Link>

                {/* Page Heading & Actions */}
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

                    {/* Right Controls: Child Switcher & Export Report Button */}
                    <div className="flex flex-wrap items-center gap-3">
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

                        {/* Export Button (Guarded by Paying School Plan & Quota) */}
                        <button
                            type="button"
                            onClick={handleExportReport}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                            title="Export subject mastery dossier"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Dossier</span>
                        </button>
                    </div>
                </div>

                {/* Full Subject Performance Breakdown (Grid / List view with numbering) */}
                <div className="pt-2">
                    <SubjectPerformanceList />
                </div>

                {/* Multi-Format Academic Export Modal */}
                <ParentSubjectPerformanceExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    studentName={studentName}
                    studentCode={studentCode}
                    className={className}
                    deptName={deptName}
                    schoolProfile={student?.school}
                    schoolId={student?.school?.id}
                    subjects={subjectPerformanceList}
                />
            </main>
        </div>
    );
}
