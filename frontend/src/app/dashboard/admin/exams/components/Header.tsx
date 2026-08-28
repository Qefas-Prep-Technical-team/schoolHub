// ...existing code...
'use client';

import { Plus, X, Layers, FileText } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [isExamTypeModalOpen, setIsExamTypeModalOpen] = useState(false);

    return (
        <>
            <header className="w-full max-w-7xl mx-auto mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8 transition-all duration-300 ease-in-out">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Admin Exam Setup
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-bold uppercase tracking-widest">
                            Oversee and manage all school examinations and subject papers.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsExamTypeModalOpen(true)}
                            className="w-full sm:w-auto whitespace-nowrap font-black uppercase tracking-widest h-12 px-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 rounded-2xl shadow-xl shadow-blue-600/20 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300"
                        >
                            <Plus size={18} strokeWidth={3} />
                            <span>Create Exam</span>
                        </Button>

                        <Link href="/dashboard/admin/exams/new?category=QUIZ" className="flex-1 sm:flex-none">
                            <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-black uppercase tracking-widest h-12 px-6 flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 text-purple-600 rounded-2xl shadow-md hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-600 hover:-translate-y-1 active:scale-95 transition-all duration-300">
                                <Plus size={18} strokeWidth={3} />
                                <span>Create Quiz</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/admin/exams/new?category=CA" className="flex-1 sm:flex-none">
                            <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-black uppercase tracking-widest h-12 px-6 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 rounded-2xl shadow-md hover:shadow-lg hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-1 active:scale-95 transition-all duration-300">
                                <Plus size={18} strokeWidth={3} />
                                <span>Create CA</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/admin/exams/new/paper" className="flex-1 sm:flex-none">
                            <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-black uppercase tracking-widest h-12 px-6 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl shadow-md hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-500 hover:-translate-y-1 active:scale-95 transition-all duration-300">
                                <Plus size={18} strokeWidth={3} />
                                <span>Create Subject Paper</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {isExamTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-3xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white">Exam Type</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-xs font-bold uppercase tracking-widest">Select the type of exam structure you want to create.</p>
                            
                            <div className="flex flex-col gap-4">
                                <Link href="/dashboard/admin/exams/new?category=EXAM&mode=SINGLE_SUBJECT" className="group" onClick={() => setIsExamTypeModalOpen(false)}>
                                    <div className="flex items-center gap-5 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                        <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 shadow-sm group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <FileText size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Single Subject</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">A standard exam focused on one specific subject paper.</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/dashboard/admin/exams/new?category=EXAM&mode=COMBINED" className="group" onClick={() => setIsExamTypeModalOpen(false)}>
                                    <div className="flex items-center gap-5 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                        <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 shadow-sm group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <Layers size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Multiple Subject</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">A composite exam containing multiple different subject papers.</p>
                                        </div>
                                    </div>
                                </Link>
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
        </>
    );
}