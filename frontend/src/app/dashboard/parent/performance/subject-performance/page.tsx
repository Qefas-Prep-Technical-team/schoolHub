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
    const [isExporting, setIsExporting] = useState(false);

    const studentName = student?.name || 'Student';
    const className = student?.classes?.[0]?.class?.name || 'Class';
    const deptName = student?.department?.name || 'Curriculum';

    const handleExportReport = async () => {
        if (!student) return;

        // Verify that the child's school is on a paying plan (plans other than FREE)
        if (!assertSchoolPayingPlan(student.school)) {
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading("Generating Department Subject Report...", { autoClose: false });

        try {
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

            const tableData = Array.from(subjectsMap.values()).map((s, index) => {
                const avg = s.totalMaxMarks > 0 
                    ? Math.round((s.totalScore / s.totalMaxMarks) * 100) 
                    : (s.count > 0 ? Math.round(s.totalScore / s.count) : 0);
                const grade = s.count > 0 ? getGradeLetter(avg) : 'N/A';
                const tier = s.count > 0 ? getPerformanceTier(avg) : 'Pending Evaluation';

                return [
                    String(index + 1),
                    s.name,
                    s.teacher,
                    String(s.count),
                    s.count > 0 ? `${avg}%` : 'N/A',
                    grade,
                    tier
                ];
            });

            await generatePDF({
                title: 'Department Subject Mastery Report',
                filename: `${student.name.replace(/\s+/g, '_')}_Subject_Performance.pdf`,
                schoolProfile: student.school,
                metaData: [
                    { label: 'Student Name', value: student.name },
                    { label: 'Student ID', value: student.id ? student.id.slice(-6).toUpperCase() : 'N/A' },
                    { label: 'Class', value: className },
                    { label: 'Department', value: deptName },
                    { label: 'Subjects Analyzed', value: String(tableData.length) },
                    { label: 'Date', value: new Date().toLocaleDateString('en-GB') }
                ],
                tableHeaders: [['#', 'Subject Name', 'Instructor', 'Assessments Taken', 'Average Score', 'Letter Grade', 'Mastery Tier']],
                tableData
            });

            toast.update(toastId, {
                render: "Report Exported Successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } catch (error) {
            console.error('Failed to export PDF:', error);
            toast.update(toastId, {
                render: "Failed to export PDF",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setIsExporting(false);
        }
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

                        {/* Export Button (Guarded by Paying School Plan) */}
                        <button
                            type="button"
                            onClick={handleExportReport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                            title="Export official PDF subject performance report"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span>{isExporting ? "Exporting..." : "Export Report"}</span>
                        </button>
                    </div>
                </div>

                {/* Full Subject Performance Breakdown (Grid / List view with numbering) */}
                <div className="pt-2">
                    <SubjectPerformanceList />
                </div>
            </main>
        </div>
    );
}
