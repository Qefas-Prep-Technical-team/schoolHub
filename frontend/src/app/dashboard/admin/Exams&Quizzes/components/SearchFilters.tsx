'use client';

import { Search } from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

export default function SearchFilters() {
    return (
        <div className="p-4 bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <label className="flex flex-col w-full">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Search
                        </span>
                        <Input
                            startIcon={<Search size={20} />}
                            placeholder="Search by Assessment Title, Subject, Teacher..."
                        />
                    </label>
                </div>

                <div>
                    <label
                        htmlFor="assessment-type"
                        className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                        Assessment Type
                    </label>
                    <Select
                        id="assessment-type"
                        options={[
                            { value: 'all', label: 'All' },
                            { value: 'exam', label: 'Exam' },
                            { value: 'quiz', label: 'Quiz' },
                            { value: 'assignment', label: 'Assignment' },
                        ]}
                    />
                </div>

                <div>
                    <label
                        htmlFor="class"
                        className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                        Class
                    </label>
                    <Select
                        id="class"
                        options={[
                            { value: 'all', label: 'All Classes' },
                            { value: 'grade10', label: 'Grade 10' },
                            { value: 'grade11', label: 'Grade 11' },
                            { value: 'grade12', label: 'Grade 12' },
                        ]}
                    />
                </div>

                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                        Status
                    </label>
                    <Select
                        id="status"
                        options={[
                            { value: 'all', label: 'All' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'upcoming', label: 'Upcoming' },
                            { value: 'ongoing', label: 'Ongoing' },
                            { value: 'marking', label: 'Marking' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'submitted', label: 'Submitted' },
                            { value: 'graded', label: 'Graded' },
                        ]}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button className="w-full">
                        <span className="truncate">Apply</span>
                    </Button>
                    <Button variant="secondary" className="w-full">
                        <span className="truncate">Clear</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}