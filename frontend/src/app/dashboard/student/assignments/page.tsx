'use client';

import { useState, useMemo } from 'react';

import AssignmentCard from './components/AssignmentCard';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import ViewToggle from './components/ViewToggle';
import { Assignment, AssignmentStatus, User } from './components/types';
import Link from 'next/link';

import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { Skeleton } from '@/components/ui/skeleton';

const statuses = ['All Statuses', 'Pending', 'Submitted', 'Graded', 'Overdue'];
const dueDates = ['All Dates', 'This Week', 'Next Week', 'This Month', 'Overdue'];

export default function AssignmentsPage() {
  const { data: assignmentsData, isLoading } = useStudentAssignments({ limit: 100 });
  const assignments: Assignment[] = assignmentsData?.assignments || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedDueDate, setSelectedDueDate] = useState('All Dates');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const dynamicSubjects = useMemo(() => {
    const subjectNames = Array.from(new Set(assignments.map(a => (a as any).subject || "General")));
    return ['All Subjects', ...subjectNames] as string[];
  }, [assignments]);

  const filteredAssignments = assignments.filter(assignment => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((assignment as any).subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((assignment as any).instructor || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Subject filter
    const matchesSubject = selectedSubject === 'All Subjects' || 
      (assignment as any).subject === selectedSubject;

    // Status filter
    const matchesStatus = selectedStatus === 'All Statuses' || 
      assignment.status === selectedStatus.toLowerCase();

    // Due date filter
    const matchesDueDate = selectedDueDate === 'All Dates' || 
      (selectedDueDate === 'Overdue' && assignment.status === 'overdue');
      // For simplicity on dates, using the same logic without dueInDays if missing
      // Real app might compute dueInDays on the fly if needed

    return matchesSearch && matchesSubject && matchesStatus && matchesDueDate;
  });

  const handleNewSubmission = () => {
    // Handle new submission logic
    // console.log('New submission clicked');
  };

  return (
      <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">  
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Assignments Overview
              </h1>
              
              {/* Analytics Button */}
              <Link href={'/dashboard/student/assignments/analytics'}>
                <button
                  className="flex items-center gap-2 bg-pink-600 cursor-pointer hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">analytics</span>
                  Analytics
                </button>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="flex-grow w-full md:w-auto">
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search assignments..."
                />
              </div>

              <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2">
                <FilterChips
                  label="Subject"
                  options={dynamicSubjects}
                  selected={selectedSubject}
                  onSelect={setSelectedSubject}
                />
                <FilterChips
                  label="Status"
                  options={statuses}
                  selected={selectedStatus}
                  onSelect={setSelectedStatus}
                />
                <FilterChips
                  label="Due Date"
                  options={dueDates}
                  selected={selectedDueDate}
                  onSelect={setSelectedDueDate}
                />
              </div>

              <div className="hidden md:flex">
                <ViewToggle 
                  value={viewMode}
                  onChange={setViewMode}
                />
              </div>
            </div>

            {/* Assignments Grid/List */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className={`rounded-xl border border-gray-200 dark:border-gray-800 ${viewMode === 'grid' ? 'h-48' : 'h-24'}`} />
                ))}
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
                  assignment
                </span>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No assignments found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  No assignments match your current filters. Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {assignments.filter(a => a.status === 'graded').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {assignments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}

