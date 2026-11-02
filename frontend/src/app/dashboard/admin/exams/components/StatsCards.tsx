import { Exam, SubjectPaper } from "@/lib/api/services/examService";
import { BookOpen, FileText, LayoutDashboard, PenTool, Plus, Info, X, Layers, Sparkles, Building2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminCreateExamModal from './AdminCreateExamModal';
import AdminCreatePaperModal from './AdminCreatePaperModal';

interface StatsCardsProps {
    examsCount?: number;
    quizzesCount?: number;
    casCount?: number;
    papersCount?: number;
}

export default function StatsCards({ examsCount = 0, quizzesCount = 0, casCount = 0, papersCount = 0 }: StatsCardsProps) {
    const stats = [
        { 
            label: 'Total Exams', 
            value: examsCount,
            icon: LayoutDashboard,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-blue-500",
            iconBg: "bg-blue-50 dark:bg-blue-900/20",
            tooltip: 'Total number of active and scheduled examinations.',
        },
        { 
            label: 'Total Quizzes', 
            value: quizzesCount,
            icon: PenTool,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-orange-500",
            iconBg: "bg-orange-50 dark:bg-orange-900/20",
            tooltip: 'Total number of quizzes available for students.',
        },
        { 
            label: 'Total CAs', 
            value: casCount,
            icon: BookOpen,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
            tooltip: 'Total number of continuous assessments recorded.',
        },
        { 
            label: 'Subject Papers', 
            value: papersCount,
            icon: FileText,
            bg: "bg-white dark:bg-slate-900",
            iconColor: "text-purple-500",
            iconBg: "bg-purple-50 dark:bg-purple-900/20",
            tooltip: 'Total distinct subject papers currently active.',
        }
    ];

    // Modals state
    const router = useRouter();
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
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                {/* Banner Card */}
                <div className="lg:col-span-12 xl:col-span-6 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-[2rem] p-8 md:p-10 flex flex-col justify-center text-white relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to manage exams?</h2>
                        <p className="text-indigo-100 font-medium mb-6 max-w-md leading-relaxed text-sm">
                            Create, schedule, and grade assessments. Keep your school's examination process organized and efficient.
                        </p>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsExamTypeModalOpen(true)}
                                className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 font-black px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer hover:-translate-y-0.5 active:scale-95"
                            >
                                <Plus size={15} strokeWidth={3} className="text-indigo-600" />
                                <span>Create Exam</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOpenExamModal('QUIZ', 'SINGLE_SUBJECT')}
                                className="w-full sm:w-auto bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-300/30 text-white font-black px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer hover:-translate-y-0.5 active:scale-95"
                            >
                                <Plus size={15} strokeWidth={3} className="text-white" />
                                <span>Create Quiz</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOpenExamModal('CA', 'SINGLE_SUBJECT')}
                                className="w-full sm:w-auto bg-emerald-500/80 hover:bg-emerald-600 border border-emerald-300/40 text-white font-black px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer hover:-translate-y-0.5 active:scale-95"
                            >
                                <Plus size={15} strokeWidth={3} className="text-white" />
                                <span>Create CA</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsPaperModalOpen(true)}
                                className="w-full sm:w-auto bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 text-white font-black px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer hover:-translate-y-0.5 active:scale-95"
                            >
                                <FileText size={15} strokeWidth={2.5} className="text-white" />
                                <span>Subject Paper</span>
                            </button>
                        </div>
                    </div>
                </div>

            {/* Stats Grid */}
            <div className="lg:col-span-12 xl:col-span-6 grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`rounded-[2rem] border border-slate-100 dark:border-slate-800 ${stat.bg} p-6 shadow-sm flex flex-col justify-center`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {stat.label}
                                    </p>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild>
                                                <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                                    <Info size={12} />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                                {stat.tooltip}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>

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