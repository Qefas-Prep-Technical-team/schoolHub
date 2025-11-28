// ...existing code...
'use client';

import { Plus } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="w-full sm:w-3/4 mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    Admin Assessments Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
                    Oversee and manage all school assessments from one place.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Simple dropdowns using native select */}
                <div className="flex gap-3">
                    <select className="h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white min-w-32">
                        <option>2023-2024</option>
                        <option>2022-2023</option>
                    </select>

                    <select className="h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white min-w-28">
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                    </select>
                </div>

                <Link href="/dashboard/admin/Exams&Quizzes/CreateExamForm" className="flex">
                    <Button className="whitespace-nowrap">
                        <Plus size={20} />
                        <span>Create New Assessment</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
}
// ...existing code...