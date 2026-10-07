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
    const sessionsBreakdown = eventData.metadata?.sessionsBreakdown || [];
    const subjects = eventData.metadata?.subjects || [];

    const isPromotion = eventData.type === 'PROMOTION';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-start justify-between gap-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10",
                                )} style={{ color: primaryColor }}>
                                    {eventData.type}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {format(new Date(eventData.date), 'MMMM d, yyyy')}
                                </span>
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {eventData.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
                                {eventData.description}
                            </DialogDescription>
                        </div>

                        {eventData.metadata?.averageScore && (
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    Final Score
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter" style={{ color: primaryColor }}>
                                        {eventData.metadata.averageScore}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    
                    {/* Class & School Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Progress</h4>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-sm font-bold text-slate-500">Academic Session</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{eventData.metadata?.session || '2025/2026'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-sm font-bold text-slate-500">Previous Class</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{eventData.metadata?.previousClass || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500">New Class</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white" style={{ color: primaryColor }}>{eventData.metadata?.newClass || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <School size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">School Details</h4>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-sm font-bold text-slate-500">School Name</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{eventData.metadata?.newSchool || eventData.school?.name || 'Current School'}</span>
                                </div>
                                {eventData.school?.principal && (
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                                        <span className="text-sm font-bold text-slate-500">Principal</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{eventData.school.principal}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500">Admission Number</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{eventData.metadata?.admissionNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isPromotion && (
                        <>
                            {/* Sessions & Terms Breakdown */}
                            <div className="space-y-8">
                                {sessionsBreakdown.map((sessionData: any, sIdx: number) => (
                                    <div key={sIdx} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-sm">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                            <Calendar size={16} className="text-primary" />
                                            Session: {sessionData.session}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {sessionData.terms.map((term: any, tIdx: number) => (
                                                <div key={tIdx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center space-y-2 hover:border-primary/30 transition-colors">
                                                    <span className="text-xs font-bold text-slate-500">{term.term}</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{term.score}</span>
                                                        <span className="text-xs font-bold text-slate-400">%</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        Grade: {term.grade}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 max-w-full truncate px-2">
                                                        {term.remarks}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Top Subjects Summary */}
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <Award size={16} />
                                    Subject Highlights
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Score</th>
                                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.map((sub: any, idx: number) => (
                                                <tr key={idx} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="py-4 px-6 text-sm font-bold text-slate-900 dark:text-white">{sub.name}</td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{sub.score}%</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className="px-2 py-1 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            {sub.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
