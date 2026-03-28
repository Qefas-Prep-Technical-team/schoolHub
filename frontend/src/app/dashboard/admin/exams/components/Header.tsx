// ...existing code...
'use client';

import { Plus } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="w-full max-w-7xl mx-auto mb-10">
            <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Admin Exam Setup
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mt-2 max-w-2xl">
                    Oversee and manage all school examinations and subject papers.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Academic Session</label>
                        <select className="h-11 px-4 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white min-w-[160px] shadow-sm transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600">
                            <option>2023-2024</option>
                            <option>2022-2023</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Term / Period</label>
                        <select className="h-11 px-4 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white min-w-[140px] shadow-sm transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600">
                            <option>Term 1</option>
                            <option>Term 2</option>
                            <option>Term 3</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Link href="/dashboard/admin/exams/new" className="flex-1 sm:flex-none">
                        <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 rounded-xl shadow-sm">
                            <Plus size={20} className="text-primary" />
                            <span>Create Exam</span>
                        </Button>
                    </Link>

                    <Link href="/dashboard/admin/exams/new?category=QUIZ" className="flex-1 sm:flex-none">
                        <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 text-purple-600 rounded-xl shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/20">
                            <Plus size={20} />
                            <span>Create Quiz</span>
                        </Button>
                    </Link>

                    <Link href="/dashboard/admin/exams/new/paper" className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 rounded-xl shadow-lg ring-1 ring-primary/20">
                            <Plus size={20} />
                            <span>Create Subject Paper</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
// ...existing code...