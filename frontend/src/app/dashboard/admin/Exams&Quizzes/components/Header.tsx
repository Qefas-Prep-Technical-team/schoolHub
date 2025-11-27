'use client';

import { Plus } from 'lucide-react';
import Button from './ui/Button';
import Select from './ui/Select';
import Link from 'next/link';


export default function Header() {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">
                    Admin Assessments Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal">
                    Oversee and manage all school assessments from one place.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <Select
                    options={[
                        { value: '2023-2024', label: '2023-2024' },
                        { value: '2022-2023', label: '2022-2023' },
                    ]}
                    className="w-40"
                />

                <Select
                    options={[
                        { value: 'term1', label: 'Term 1' },
                        { value: 'term2', label: 'Term 2' },
                        { value: 'term3', label: 'Term 3' },
                    ]}
                    className="w-32"
                />
                <Link href={"/dashboard/admin/Exams&Quizzes/CreateExamForm"}>
                    <Button>
                        <Plus size={20} />
                        <span className="truncate">Create New Assessment</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
}