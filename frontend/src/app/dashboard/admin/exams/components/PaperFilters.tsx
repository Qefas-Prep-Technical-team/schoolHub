'use client';

import { Search } from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

interface PaperFiltersProps {
    filters: {
        searchQuery: string;
        subjectId: string;
        teacherId: string;
        status: string;
    };
    onFilterChange: (newFilters: Partial<PaperFiltersProps['filters']>) => void;
    subjects: { value: string; label: string }[];
    teachers: { value: string; label: string }[];
}

export default function PaperFilters({
    filters,
    onFilterChange,
    subjects,
    teachers,
}: PaperFiltersProps) {
    const subjectOptions = [
        { value: 'all', label: 'All Subjects' },
        ...subjects,
    ];

    const teacherOptions = [
        { value: 'all', label: 'All Teachers' },
        ...teachers,
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'REVIEW', label: 'Review' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'PUBLISHED', label: 'Published' },
    ];

    return (
        <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
                
                {/* Search field */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <label className="flex flex-col w-full">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                            Search Papers
                        </span>
                        <div className="relative group">
                            <Input
                                startIcon={
                                    <Search
                                        size={18}
                                        className="text-slate-400 group-focus-within:text-primary transition-colors"
                                    />
                                }
                                placeholder="Search by paper title, subject, teacher..."
                                className="h-12 rounded-2xl border-slate-200 focus:ring-primary/20"
                                value={filters.searchQuery}
                                onChange={(val) => onFilterChange({ searchQuery: val })}
                            />
                        </div>
                    </label>
                </div>

                {/* Subject filter */}
                <div className="col-span-1">
                    <label htmlFor="subject" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Filter by Subject
                    </label>
                    <Select
                        id="subject"
                        value={filters.subjectId}
                        onChange={(val) => onFilterChange({ subjectId: val })}
                        options={subjectOptions}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                {/* Teacher filter */}
                <div className="col-span-1">
                    <label htmlFor="teacher" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Filter by Teacher
                    </label>
                    <Select
                        id="teacher"
                        value={filters.teacherId}
                        onChange={(val) => onFilterChange({ teacherId: val })}
                        options={teacherOptions}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                {/* Status filter */}
                <div className="col-span-1">
                    <label htmlFor="paper-status" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Status
                    </label>
                    <div className="flex gap-2">
                        <Select
                            id="paper-status"
                            value={filters.status}
                            onChange={(val) => onFilterChange({ status: val })}
                            options={statusOptions}
                            className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50 flex-1"
                        />
                        <Button
                            variant="secondary"
                            className="h-12 px-4 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-slate-50 shrink-0"
                            onClick={() =>
                                onFilterChange({
                                    searchQuery: '',
                                    subjectId: 'all',
                                    teacherId: 'all',
                                    status: 'all',
                                })
                            }
                        >
                            Reset
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
