'use client';

import { Plus, X, Layers, FileText, Info, Sparkles, Building2 } from 'lucide-react';
import Button from './ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminCreateExamModal from './AdminCreateExamModal';
import AdminCreatePaperModal from './AdminCreatePaperModal';

export default function Header() {
    const router = useRouter();

    // Modals state
    const [isExamTypeModalOpen, setIsExamTypeModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [examCategory, setExamCategory] = useState<'EXAM' | 'QUIZ' | 'CA'>('EXAM');
    const [examMode, setExamMode] = useState<'SINGLE_SUBJECT' | 'COMBINED'>('SINGLE_SUBJECT');
    const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

    const handleOpenExamModal = (category: 'EXAM' | 'QUIZ' | 'CA', mode: 'SINGLE_SUBJECT' | 'COMBINED' = 'SINGLE_SUBJECT') => {
        setExamCategory(category);
        setExamMode(mode);
        setIsExamTypeModalOpen(false);
        setIsExamModalOpen(true);
    };

    const handleExamSuccess = (examId: string, paperId?: string) => {
        setIsExamModalOpen(false);
        if (paperId) {
            router.push(`/dashboard/admin/exams/${examId}/papers/${paperId}`);
        } else {
            router.push(`/dashboard/admin/exams/${examId}/papers`);
        }
    };

    const handlePaperSuccess = (paperId: string) => {
        setIsPaperModalOpen(false);
        router.push(`/dashboard/admin/exams/papers/${paperId}`);
    };

    return (
        <>
            <header className="w-full mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8 transition-all duration-300 ease-in-out">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Admin Exam Setup
                            </h1>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none transition-colors mt-2">
                                            <Info size={24} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                        Oversee and manage all school examinations, quizzes, and continuous assessments in one centralized dashboard.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-bold uppercase tracking-widest">
                            Oversee and manage all school examinations and subject papers.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-3">
                        <Button
                            onClick={() => setIsExamTypeModalOpen(true)}
                            className="w-full whitespace-nowrap font-black uppercase tracking-wider sm:tracking-widest h-12 px-3 sm:px-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/80 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-[11px] sm:text-xs cursor-pointer"
                        >
                            <Plus size={16} strokeWidth={3} className="text-white" />
                            <span className="text-white">Create Exam</span>
                        </Button>

                        <Button 
                            variant="secondary" 
                            onClick={() => handleOpenExamModal('QUIZ', 'SINGLE_SUBJECT')}
                            className="w-full whitespace-nowrap font-black uppercase tracking-wider sm:tracking-widest h-12 px-3 sm:px-6 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200/80 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-[11px] sm:text-xs"
                        >
                            <Plus size={16} strokeWidth={3} className="text-purple-600 dark:text-purple-400" />
                            <span>Create Quiz</span>
                        </Button>

                        <Button 
                            variant="secondary" 
                            onClick={() => handleOpenExamModal('CA', 'SINGLE_SUBJECT')}
                            className="w-full whitespace-nowrap font-black uppercase tracking-wider sm:tracking-widest h-12 px-3 sm:px-6 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-[11px] sm:text-xs"
                        >
                            <Plus size={16} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Create CA</span>
                        </Button>

                        <Button 
                            variant="secondary" 
                            onClick={() => setIsPaperModalOpen(true)}
                            className="w-full whitespace-nowrap font-black uppercase tracking-wider sm:tracking-widest h-12 px-3 sm:px-6 flex items-center justify-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 dark:bg-slate-900 dark:hover:bg-slate-800/90 dark:text-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-[11px] sm:text-xs"
                        >
                            <Plus size={16} strokeWidth={3} className="text-slate-600 dark:text-slate-400" />
                            <span>Subject Paper</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Exam Type Selection Modal */}
            {isExamTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-3xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white">Exam Type</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-xs font-bold uppercase tracking-widest">Select the type of exam structure you want to create.</p>

                            <div className="flex flex-col gap-4">
                                <div 
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleOpenExamModal('EXAM', 'SINGLE_SUBJECT')} 
                                    className="group cursor-pointer"
                                >
                                    <div className="flex items-center gap-5 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                        <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 shadow-sm group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <FileText size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Single Subject</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">A standard exam focused on one specific subject paper.</p>
                                        </div>
                                    </div>
                                </div>

                                <div 
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleOpenExamModal('EXAM', 'COMBINED')} 
                                    className="group cursor-pointer"
                                >
                                    <div className="flex items-center gap-5 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                        <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 shadow-sm group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <Layers size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Multiple Subject</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">A composite exam containing multiple different subject papers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsExamTypeModalOpen(false)}
                            className="absolute top-6 right-6 p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* In-Page Create Exam / Quiz / CA Dialog */}
            <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
                <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            Create {
                                examCategory === 'EXAM' 
                                    ? (examMode === 'COMBINED' ? 'Multi-Paper Exam' : 'Single Paper Exam') 
                                    : examCategory === 'CA' 
                                    ? 'Continuous Assessment' 
                                    : 'Quiz'
                            }
                        </DialogTitle>
                    </DialogHeader>
                    <AdminCreateExamModal
                        category={examCategory}
                        initialMode={examMode}
                        onSuccess={handleExamSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* In-Page Create Subject Paper Dialog */}
            <Dialog open={isPaperModalOpen} onOpenChange={setIsPaperModalOpen}>
                <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Create Standalone Subject Paper
                        </DialogTitle>
                    </DialogHeader>
                    <AdminCreatePaperModal onSuccess={handlePaperSuccess} />
                </DialogContent>
            </Dialog>
        </>
    );
}