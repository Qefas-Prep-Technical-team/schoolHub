"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { FileText, Award, Calendar, BookOpen, GraduationCap, X, ChevronRight, School } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface HistoryDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    eventData: any
    primaryColor: string
}

export function HistoryDetailsModal({ isOpen, onClose, eventData, primaryColor }: HistoryDetailsModalProps) {
    if (!eventData) return null;

    // Real data only
    const meta = eventData.meta || eventData.metadata || {};
    const sessionsBreakdown = meta.sessionsBreakdown || [];
    const subjects = meta.subjects || [];
    const sessionName = meta.session || eventData.session || "2025/2026";
    const termName = meta.termDisplay || meta.term || eventData.term;
    const className = meta.className || meta.newClass || eventData.className || "Class";
    const averageScore = meta.termAverage ?? meta.averageScore;

    const isAcademic = eventData.type === 'ACADEMIC_RECORD' || eventData.eventType === 'ACADEMIC_RECORD' || eventData.type === 'PROMOTION' || subjects.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-start justify-between gap-4 relative z-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10",
                                )} style={{ color: primaryColor }}>
                                    {eventData.eventType || eventData.type}
                                </span>
                                {(sessionName || termName) && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                        {[sessionName, termName].filter(Boolean).join(" • ")}
                                    </span>
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {format(new Date(eventData.date), 'MMMM d, yyyy')}
                                </span>
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {eventData.title}
                            </DialogTitle>
                            {eventData.description && (
                                <DialogDescription className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
                                    {eventData.description}
                                </DialogDescription>
                            )}
                        </div>

                        {averageScore !== undefined && averageScore !== null && (
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    Term Average
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter" style={{ color: primaryColor }}>
                                        {averageScore}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                    
                    {/* Class & Cohort Context Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-xs">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Cohort</h4>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-500">Class Cohort</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{className}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-500">Academic Session</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{sessionName}</span>
                                </div>
                                {termName && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Academic Term</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{termName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-xs">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <School size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Institution & Status</h4>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-500">School Name</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{meta.newSchool || eventData.school?.name || 'School Campus'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-500">Total Subjects</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{subjects.length || meta.totalSubjects || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Performance Status</span>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{meta.termGradeLabel || 'Certified Record'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subjects and Grades Breakdown */}
                    {subjects.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Award size={16} className="text-indigo-500" />
                                <span>Subject Grades & Assessment Breakdown</span>
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="py-3.5 px-5">Subject</th>
                                            <th className="py-3.5 px-5 text-center">Score / Max</th>
                                            <th className="py-3.5 px-5 text-center">Percentage</th>
                                            <th className="py-3.5 px-5 text-right">Grade Letter</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjects.map((sub: any, idx: number) => {
                                            const subName = sub.subjectName || sub.name || "Subject";
                                            const subPercentage = sub.percentage ?? sub.score ?? 0;
                                            const subScore = sub.score !== undefined ? `${sub.score} / ${sub.maxMarks || 100}` : `${subPercentage}%`;
                                            const subGrade = sub.grade || "N/A";

                                            return (
                                                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="py-3.5 px-5">
                                                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                                                            {subName}
                                                        </div>
                                                        {sub.subjectCode && (
                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                {sub.subjectCode}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {subScore}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-center">
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                                            {subPercentage}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                                            {subGrade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
