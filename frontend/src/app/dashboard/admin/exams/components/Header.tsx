// ...existing code...
'use client';

import { Plus } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

export default function Header() {
    return (
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
                    <Link href="/dashboard/admin/exams/new" className="flex-1 sm:flex-none">
                        <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-transform duration-200">
                            <Plus size={20} className="text-primary" />
                            <span>Create Exam</span>
                        </Button>
                    </Link>

                    <Link href="/dashboard/admin/exams/new?category=QUIZ" className="flex-1 sm:flex-none">
                        <Button variant="secondary" className="w-full sm:w-auto whitespace-nowrap font-bold h-11 px-6 flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 text-purple-600 rounded-xl shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:scale-[1.02] active:scale-95 transition-transform duration-200">
                            <Plus size={20} />
                            <span>Create Quiz</span>
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
    );
}
// ...existing code...
