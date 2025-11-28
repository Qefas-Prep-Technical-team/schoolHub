"use client";
import { useState } from 'react';

import SearchInput from './components/ui/SearchInput';
import Button from './components/ui/Button';
import { Download, Plus, Upload } from 'lucide-react';
import Breadcrumb from './components/Breadcrumb';
import StatsCards from './components/StatsCards';
import Filters from './components/Filters';
import GradeDistribution from './components/GradeDistribution';
import GradesTable from './components/GradesTable';
import Pagination from './components/Pagination';
import Link from 'next/link';

const mockGrades = [
    {
        id: '1',
        studentName: 'Olivia Chen',
        studentId: '#STU-001',
        className: '7A',
        subject: 'Mathematics',
        examType: 'Midterm',
        score: 92,
        grade: 'A',
        remarks: 'Excellent work on calculus.',
        status: 'pass' as const
    },
    {
        id: '2',
        studentName: 'Benjamin Carter',
        studentId: '#STU-002',
        className: '7A',
        subject: 'History',
        examType: 'Midterm',
        score: 85,
        grade: 'B',
        remarks: 'Good understanding of the material.',
        status: 'pass' as const
    },
    {
        id: '3',
        studentName: 'Ava Nguyen',
        studentId: '#STU-005',
        className: '7A',
        subject: 'Art',
        examType: 'Final',
        score: 55,
        grade: 'F',
        remarks: 'Struggling with core concepts.',
        status: 'fail' as const
    },
    {
        id: '4',
        studentName: 'Sophia Rodriguez',
        studentId: '#STU-003',
        className: '7A',
        subject: 'Science',
        examType: 'Final',
        score: 78,
        grade: 'C',
        remarks: 'Needs improvement in lab reports.',
        status: 'pass' as const
    },
    {
        id: '5',
        studentName: 'Liam Goldberg',
        studentId: '#STU-004',
        className: '7A',
        subject: 'English',
        examType: 'Midterm',
        score: 95,
        grade: 'A',
        remarks: 'Outstanding essay submission.',
        status: 'pass' as const
    }
];

const mockStats = {
    totalStudents: 1250,
    averageGrade: '82.5% (B)',
    passingStudents: 1198,
    failingStudents: 52
};

const gradeDistribution = [
    { grade: 'A', percentage: 90, color: 'bg-green-500', hoverColor: 'hover:bg-green-600 dark:hover:bg-green-400' },
    { grade: 'B', percentage: 75, color: 'bg-green-500', hoverColor: 'hover:bg-green-600 dark:hover:bg-green-400' },
    { grade: 'C', percentage: 50, color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600 dark:hover:bg-yellow-300' },
    { grade: 'D', percentage: 20, color: 'bg-red-500', hoverColor: 'hover:bg-red-600 dark:hover:bg-red-400' },
    { grade: 'F', percentage: 10, color: 'bg-red-500', hoverColor: 'hover:bg-red-600 dark:hover:bg-red-400' }
];

const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Grades' }
];

export default function GradesManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        class: 'All Classes',
        term: 'Fall 2024',
        subject: 'All Subjects'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalItems = 25;

    const handleEditGrade = (gradeId: string) => {
        console.log('Edit grade:', gradeId);
        // Implement edit logic
    };

    const handleExport = () => {
        console.log('Export grades');
        // Implement export logic
    };

    const handleAddGrade = () => {
        console.log('Add new grade');
        // Implement add grade logic
    };

    const handleNewEntry = () => {
        console.log('Create new entry');
        // Implement new entry logic
    };

    return (
        <div className="relative flex min-h-screen w-full">


            <main className="flex-1 p-6 lg:p-8">
                <div className="mx-auto max-w-full">
                    <div className="flex flex-col gap-6 mb-8">
                        {/* Breadcrumb and Title */}
                        <div className="flex flex-col gap-1">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                                Grades Management
                            </h1>
                        </div>

                        {/* Search and Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search by student name or ID..."
                            />
                            <div className="flex items-center gap-3">
                                <Button variant="secondary" onClick={handleExport}>
                                    <Upload size={16} />
                                    <span className="truncate">Export</span>
                                </Button>
                                <Link href="/dashboard/admin/grades/batch-upload">
                                    <Button variant="secondary" onClick={handleExport}>
                                        <Download size={16} />
                                        <span className="truncate">Import</span>
                                    </Button>
                                </Link>
                                <Link href="/dashboard/admin/grades/batch-grade-entry">
                                    <Button onClick={handleAddGrade}>
                                        <Plus size={16} />
                                        <span className="truncate">Batch Add</span>
                                    </Button>
                                </Link>
                                <Link href="/dashboard/admin/grades/batch-upload">
                                    <Button onClick={handleAddGrade}>
                                        <Plus size={16} />
                                        <span className="truncate">Add Grade</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <StatsCards stats={mockStats} />

                    {/* Main Content */}
                    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C2D] p-6 shadow-sm">
                        {/* Filters */}
                        <Filters filters={filters} onFilterChange={setFilters} />

                        {/* Grade Distribution */}
                        <GradeDistribution
                            distribution={gradeDistribution}
                            overallAverage="B+"
                            improvement="(+2.1%)"
                        />

                        {/* Grades Table */}
                        <GradesTable grades={mockGrades} onEdit={handleEditGrade} />

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={5}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}