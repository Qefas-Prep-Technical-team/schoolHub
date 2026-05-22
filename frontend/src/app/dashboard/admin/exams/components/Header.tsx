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
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Admin Exam Setup
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mt-2 max-w-2xl font-medium">
                            Oversee and manage all school examinations and subject papers.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsExamTypeModalOpen(true)}
                            className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-transform duration-200"
                        >
                            <Plus size={20} className="text-primary" />
                            <span>Create Exam</span>
                        </Button>

                        <Link href="/dashboard/admin/exams/new?category=QUIZ" className="flex-1 sm:flex-none">
                            <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 text-purple-600 rounded-xl shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:scale-[1.02] active:scale-95 transition-transform duration-200">
                                <Plus size={20} />
                                <span>Create Quiz</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/admin/exams/new?category=CA" className="flex-1 sm:flex-none">
                            <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-transform duration-200">
                                <Plus size={20} />
                                <span>Create CA</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/admin/exams/new/paper" className="flex-1 sm:flex-none">
                            <Button className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 rounded-xl shadow-lg ring-1 ring-primary/20 hover:scale-[1.02] active:scale-95 transition-transform duration-200">
                                <Plus size={20} />
                                <span>Create Subject Paper</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {isExamTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Exam Type</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Select the type of exam structure you want to create.</p>
                            
                            <div className="flex flex-col gap-4">
                                <Link href="/dashboard/admin/exams/new?category=EXAM&mode=SINGLE_SUBJECT" className="group" onClick={() => setIsExamTypeModalOpen(false)}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Single Subject</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A standard exam focused on one specific subject paper.</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/dashboard/admin/exams/new?category=EXAM&mode=COMBINED" className="group" onClick={() => setIsExamTypeModalOpen(false)}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 group-hover:scale-110 transition-transform">
                                            <Layers size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Multiple Subject</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A composite exam containing multiple different subject papers.</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setIsExamTypeModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}