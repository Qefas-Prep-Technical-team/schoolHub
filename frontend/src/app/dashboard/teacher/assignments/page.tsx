'use client';

import { useState, useMemo } from 'react';
import { Assignment } from './components/types';
import PageHeader from './components/PageHeader';
import Button from './components/ui/Button';
import AssignmentFilters from './components/AssignmentFilters';
import AssignmentCard from './components/AssignmentCard';
import Pagination from './components/Pagination';
import Link from 'next/link';


// Mock data
const mockAssignments: Assignment[] = [
    {
        id: '1',
        title: 'Chapter 5: Cell Biology Lab Report',
        subject: 'Biology',
        className: 'Grade 10A',
        status: 'published',
        dueDate: 'Oct 26, 2023, 11:59 PM',
        submitted: 18,
        totalStudents: 25,
        progress: 72
    },
    {
        id: '2',
        title: 'The Industrial Revolution Essay',
        subject: 'History',
        className: 'Grade 10B',
        status: 'overdue',
        dueDate: 'Oct 15, 2023, 5:00 PM',
        submitted: 22,
        totalStudents: 24,
        progress: 91
    },
    {
        id: '3',
        title: 'Algebra II: Problem Set 4',
        subject: 'Mathematics',
        className: 'Grade 11',
        status: 'due-soon',
        dueDate: 'Tomorrow, 9:00 AM',
        submitted: 5,
        totalStudents: 28,
        progress: 18
    },
    {
        id: '4',
        title: 'Physics Worksheet: Kinematics',
        subject: 'Physics',
        className: 'Grade 11',
        status: 'draft',
        dueDate: 'Not set',
        submitted: 0,
        totalStudents: 26,
        progress: 0
    }
];

export default function AssignmentsPage() {
    const [assignments] = useState<Assignment[]>(mockAssignments);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', subject: '' });
    const [view, setView] = useState<'list' | 'grid'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter and search assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter(assignment => {
            // Search filter
            const matchesSearch =
                !searchQuery ||
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.className.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = !filters.status || assignment.status === filters.status;

            // Subject filter
            const matchesSubject = !filters.subject || assignment.subject.toLowerCase() === filters.subject.toLowerCase();

            return matchesSearch && matchesStatus && matchesSubject;
        });
    }, [assignments, searchQuery, filters]);

    // Paginate assignments
    const paginatedAssignments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAssignments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAssignments, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

    // Event handlers
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleFilterChange = (newFilters: { status: string; subject: string }) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page on new filter
    };

    const handleCreateAssignment = () => {
        console.log('Create new assignment');
        // Navigate to create assignment page
    };

    const handleEdit = (id: string) => {
        console.log('Edit assignment:', id);
    };

    const handleGrade = (id: string) => {
        console.log('Grade assignment:', id);
    };

    const handleDelete = (id: string) => {
        console.log('Delete assignment:', id);
        // Show confirmation modal
    };

    const handleViewDetails = (id: string) => {
        console.log('View details:', id);
    };

    return (
        <main>
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <PageHeader
                    title="Assignments"
                    description="Manage all your assignments in one place."
                    action={
                        <Link href="/dashboard/teacher/assignments/create-assignment">
                            <Button
                                onClick={handleCreateAssignment}
                                icon="add_circle"
                                className="hidden md:flex"
                            >
                                Create New Assignment
                            </Button>
                        </Link>
                    }
                />

                {/* Filters */}
                <AssignmentFilters
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    onViewChange={setView}
                />

                {/* Assignments Grid */}
                <div className={`grid gap-6 ${view === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                    }`}>
                    {paginatedAssignments.map((assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onEdit={handleEdit}
                            onGrade={handleGrade}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>

                {/* No results message */}
                {filteredAssignments.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                            search_off
                        </span>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No assignments found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {filteredAssignments.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredAssignments.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </main>
    );
}