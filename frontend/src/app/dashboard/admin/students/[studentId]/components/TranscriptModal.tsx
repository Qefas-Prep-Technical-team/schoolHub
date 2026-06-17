"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { FileText, Download, Loader2, Award, ShieldCheck, Calendar, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'


import { TranscriptPDF } from './TranscriptPDF'

interface TranscriptModalProps {
    isOpen: boolean
    onClose: () => void
    student: any
    school: any
    grades: any[]
    className: string
    primaryColor: string
}

export function TranscriptModal({ isOpen, onClose, student, school, grades, className, primaryColor }: TranscriptModalProps) {
    if (!student) return null

    const [isGenerating, setIsGenerating] = React.useState(false)
    const totalAssessments = grades.length

    const handleDownload = async () => {
        try {
            setIsGenerating(true)
            const { pdf } = await import('@react-pdf/renderer')
            const blob = await pdf(
                <TranscriptPDF 
                    student={student} 
                    school={school} 
                    grades={grades} 
                    className={className} 
                />
            ).toBlob()
            
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${student.name}_Transcript_${new Date().getFullYear()}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to generate PDF:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    // Grouping logic for preview
    const sectionsMap: Record<string, { title: string; papers: any[] }> = {};
    grades.forEach(g => {
        if (g.exam) {
            // Filter out totals for the preview as well
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
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-slate-50 dark:bg-slate-950 rounded-[2.5rem]">
                {/* Header Section */}
                <div className="relative p-8 pb-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Award size={160} strokeWidth={1} />
                    </div>
                    
                    <DialogHeader className="relative z-10 text-white">
                        <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                            <FileText size={28} className="text-white" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight leading-none mb-2">Academic Record</DialogTitle>
                        <DialogDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest">
                            Reviewing reports for {student.name}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content Section */}
                <div className="p-8 -mt-24 relative z-20">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5 space-y-6">
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-slate-400">
                                    <BookOpen size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Total Exams</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{sections.length}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-slate-400">
                                    <Calendar size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Papers Recorded</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{totalAssessments}</p>
                            </div>
                        </div>

                        {/* Detailed Reports List */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Exam History & Components</h4>
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                                {sections.length > 0 ? (
                                    sections.map((section, idx) => (
                                        <div key={idx} className="p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h5>
                                                <span className="text-[8px] font-black px-2 py-1 bg-white dark:bg-white/5 rounded-lg shadow-sm text-slate-500 border border-slate-100 dark:border-white/10">
                                                    {section.papers.length} PAPERS
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {section.papers.map((paper, pIdx) => (
                                                    <div key={pIdx} className="flex justify-between items-center text-[10px]">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                                            <span className="font-bold text-slate-600 dark:text-slate-400">{paper.subject}</span>
                                                        </div>
                                                        <span className="font-black text-slate-900 dark:text-white">{paper.score}/{paper.maxMarks}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center space-y-3">
                                        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto opacity-50">
                                            <FileText size={20} className="text-slate-400" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No exam records found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-4">
                            <button
                                onClick={handleDownload}
                                disabled={isGenerating || sections.length === 0}
                                className={cn(
                                    "w-full h-16 rounded-[1.5rem] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50",
                                    isGenerating ? "bg-slate-400 cursor-not-allowed" : ""
                                )}
                                style={!isGenerating && sections.length > 0 ? { backgroundColor: primaryColor } : {}}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Generating Official PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} strokeWidth={3} />
                                        Generate Official Transcript
                                    </>
                                )}
                            </button>
                            
                            <button 
                                onClick={onClose}
                                className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
