"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { FileText, Download, Loader2, Award, ShieldCheck, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TranscriptPDF } from './TranscriptPDF';
import { ExportQuotaBanner } from '@/app/dashboard/admin/grades/components/export/ExportQuotaBanner';
import { getMonthlyExportUsage, incrementMonthlyExportUsage } from '@/utils/exportQuotaManager';
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { toast } from 'react-toastify';

interface TranscriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    school: any;
    grades: any[];
    className: string;
    primaryColor: string;
}

export function TranscriptModal({
    isOpen,
    onClose,
    student,
    school,
    grades,
    className,
    primaryColor,
}: TranscriptModalProps) {
    if (!student) return null;

    const { user } = useAuthStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const schoolId = school?.id || school?.schoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const isPaying = Boolean(
        school?.plan && school.plan.toUpperCase() !== 'FREE'
    );

    const quotaContextId = schoolId || 'school_context';
    const quota = getMonthlyExportUsage(quotaContextId);
    const isQuotaReached = !isPaying && quota.remaining <= 0;

    const handleDownload = async () => {
        if (isQuotaReached) {
            toast.error('Monthly export quota reached (10/10). Please upgrade for unlimited transcript generation.');
            return;
        }

        try {
            setIsGenerating(true);
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(
                <TranscriptPDF
                    student={student}
                    school={school}
                    grades={grades}
                    className={className}
                />
            ).toBlob();

            const schoolName = (school?.name || 'School').replace(/\s+/g, '_');
            const studentName = (student.name || 'Student').replace(/\s+/g, '_');
            const fileName = `${schoolName}-${studentName}-Official_Transcript_${new Date().getFullYear()}.pdf`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Quota decrement for free tier
            if (!isPaying) {
                incrementMonthlyExportUsage(quotaContextId);
            }

            // Dispatch leadership notification
            if (schoolId) {
                await dispatchExportLeadershipNotification({
                    schoolId,
                    actorName: user?.name || 'Administrator',
                    actorRole: user?.role || 'ADMIN',
                    resourceTitle: `Official Academic Transcript (${student.name})`,
                    recordCount: 1,
                    format: 'PDF',
                }).catch(() => undefined);
            }

            toast.success('Official Transcript generated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Failed to generate transcript PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    // Grouping logic for preview
    const sectionsMap: Record<string, { title: string; papers: any[] }> = {};
    grades.forEach((g) => {
        if (g.exam) {
            const subjectName = g.subject?.toLowerCase() || '';
            const examTitle = g.exam.title?.toLowerCase() || '';
            if (subjectName.includes('(total)') || subjectName === examTitle || g.assessmentType === 'TOTAL') return;

            const examId = g.examId || g.exam.title;
            if (!sectionsMap[examId]) {
                sectionsMap[examId] = { title: g.exam.title, papers: [] };
            }
            sectionsMap[examId].papers.push(g);
        }
    });

    const sections = Object.values(sectionsMap);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                <div className="p-8 pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-200/50">
                                Official Record
                            </span>
                            {isPaying ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200/50">
                                    <Sparkles size={11} /> PRO
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                    FREE
                                </span>
                            )}
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                            Academic Transcript Preview
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {student?.name} • Admission: {student?.studentCode || 'N/A'}
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-8 pt-4 space-y-5 overflow-y-auto flex-1">
                    <ExportQuotaBanner
                        isPaying={isPaying}
                        used={quota.used}
                        limit={quota.limit}
                        remaining={quota.remaining}
                        userRole="ADMIN"
                    />

                    {/* Preview Content */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                Transcript Assessment Breakdown
                            </h4>
                            <span className="text-xs font-bold text-slate-500">{sections.length} Academic Periods</span>
                        </div>

                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {sections.length > 0 ? (
                                sections.map((sec, idx) => (
                                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                {sec.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {sec.papers.length} Papers Included
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {sec.papers.map((p, pIdx) => (
                                                <div key={pIdx} className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                                                    <span className="truncate text-slate-600 dark:text-slate-400 font-medium">{p.subject}</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{p.score}/{p.maxMarks}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center space-y-2">
                                    <FileText size={24} className="mx-auto text-slate-400 opacity-60" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No completed exam records found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span>Leadership Endorsement</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {isPaying ? 'Official Digital Stamp' : 'Standard Dash Line'}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isGenerating || sections.length === 0}
                            className={cn(
                                "flex-1 h-12 rounded-xl text-white font-bold uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50",
                                isGenerating ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                            )}
                            style={!isGenerating && sections.length > 0 && primaryColor ? { backgroundColor: primaryColor } : {}}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={15} />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={15} />
                                    <span>Download Official Transcript</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
