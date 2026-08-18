"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Award, BookOpen, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    exam: any
    primaryColor: string
    studentName: string
}

export function ExamDetailsModal({ isOpen, onClose, exam, primaryColor, studentName }: ExamDetailsModalProps) {
    if (!exam) return null

    const aggregatePercentage = exam.totalMax > 0 ? Math.round((exam.totalScore / exam.totalMax) * 100) : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-slate-50 dark:bg-slate-950 rounded-[2.5rem]">
                {/* Header Section */}
                <div className="relative p-8 pb-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Award size={160} strokeWidth={1} />
                    </div>
                    
                    <DialogHeader className="relative z-10 text-white">
                        <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                            <BookOpen size={28} className="text-white" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight leading-none mb-2">{exam.title}</DialogTitle>
                        <DialogDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest">
                            {exam.session} • {studentName}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content Section */}
                <div className="p-8 -mt-24 relative z-20">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5 space-y-6">
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1 text-slate-400">
                                    <TrendingUp size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Aggregate</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{aggregatePercentage}%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1 text-slate-400">
                                    <BookOpen size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Total Papers</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{exam.papers.length}</p>
                            </div>
                        </div>

                        {/* Detailed Papers List */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Subject Performance</h4>
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                                {exam.papers.map((paper: any, pIdx: number) => {
                                    const scorePercentage = paper.maxMarks > 0 ? Math.round((paper.score / paper.maxMarks) * 100) : 0;
                                    
                                    return (
                                        <div key={pIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between transition-all">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{paper.subject}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{paper.assessmentType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-900 dark:text-white">{paper.score}/{paper.maxMarks}</p>
                                                <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                                                    {scorePercentage}%
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4">
                            <button 
                                onClick={onClose}
                                className="w-full h-14 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
