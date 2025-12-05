'use client';

import { useState } from 'react';

import AssignmentCard from './components/AssignmentCard';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import ViewToggle from './components/ViewToggle';
import { Assignment, AssignmentStatus, User } from './components/types';
import Link from 'next/link';

// Mock data
const mockUser: User = {
  name: 'Alex Johnson',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFXnU12PnVSDhnNPB6Iu0k4IAbfDCQaBUHEwwciyRvTC5Dvt3ZO_ylDnm8wJfFsgbUsgcamVxCFYh5tIt7IYHZ-J7BoTO0EaaojQollVYQFjFyOHttuq4CyVNSCCPoTSijxZY_w7ujCuczIWWqUv7TXTK4LCQ_l0wImRo9cNm-4JetIbwHqR12M-9jnFZfTNIgRzD-G9Wf_E3GjSCmxi2qDifUs1ETj7meNtSF5rMaiZmvlNlYF2-3mX6EelpqrUqU1psy5eRgtcA',
  grade: 'Grade 10'
};

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'The Renaissance Essay',
    subject: 'History 101',
    instructor: 'Prof. Eleanor Vance',
    dueDate: '2024-10-15',
    status: 'graded' as AssignmentStatus,
    progress: 100,
    grade: 'A+',
    submissionDate: '2024-10-15',
    color: 'green'
  },
  {
    id: '2',
    title: 'Polynomial Functions Worksheet',
    subject: 'Algebra II',
    instructor: 'Mr. Ben Carter',
    dueDate: '2024-10-26',
    status: 'submitted' as AssignmentStatus,
    progress: 75,
    dueInDays: 3,
    color: 'blue'
  },
  {
    id: '3',
    title: 'Lab Report: Titration',
    subject: 'Chemistry',
    instructor: 'Dr. Anya Sharma',
    dueDate: '2024-11-02',
    status: 'pending' as AssignmentStatus,
    progress: 0,
    dueInDays: 10,
    color: 'orange'
  },
  {
    id: '4',
    title: '"The Great Gatsby" Analysis',
    subject: 'English Literature',
    instructor: 'Ms. Davis',
    dueDate: '2024-10-20',
    status: 'overdue' as AssignmentStatus,
    progress: 50,
    overdueDays: 3,
    color: 'red'
  },
  {
    id: '5',
    title: 'Mapping South America',
    subject: 'World Geography',
    instructor: 'Mr. Rodriguez',
    dueDate: '2024-11-15',
    status: 'pending' as AssignmentStatus,
    progress: 0,
    dueInDays: 23,
    color: 'orange'
  },
  {
    id: '6',
    title: 'Newton\'s Laws Problem Set',
    subject: 'Physics',
    instructor: 'Dr. Chen',
    dueDate: '2024-10-18',
    status: 'graded' as AssignmentStatus,
    progress: 100,
    grade: 'B',
    submissionDate: '2024-10-18',
    color: 'green'
  }
];

const subjects = ['All Subjects', 'History 101', 'Algebra II', 'Chemistry', 'English Literature', 'World Geography', 'Physics'];
const statuses = ['All Statuses', 'Pending', 'Submitted', 'Graded', 'Overdue'];
const dueDates = ['All Dates', 'This Week', 'Next Week', 'This Month', 'Overdue'];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedDueDate, setSelectedDueDate] = useState('All Dates');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAssignments = assignments.filter(assignment => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    // Subject filter
    const matchesSubject = selectedSubject === 'All Subjects' || 
      assignment.subject === selectedSubject;

    // Status filter
    const matchesStatus = selectedStatus === 'All Statuses' || 
      assignment.status === selectedStatus.toLowerCase();

    // Due date filter
    const matchesDueDate = selectedDueDate === 'All Dates' || 
      (selectedDueDate === 'Overdue' && assignment.status === 'overdue') ||
      (selectedDueDate === 'This Week' && assignment.dueInDays && assignment.dueInDays <= 7) ||
      (selectedDueDate === 'Next Week' && assignment.dueInDays && assignment.dueInDays > 7 && assignment.dueInDays <= 14) ||
      (selectedDueDate === 'This Month' && assignment.dueInDays && assignment.dueInDays <= 30);

    return matchesSearch && matchesSubject && matchesStatus && matchesDueDate;
  });

  const handleNewSubmission = () => {
    // Handle new submission logic
    console.log('New submission clicked');
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">  
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Heading */}
         <div className="max-w-7xl mx-auto">
  {/* Page Heading */}
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
    <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
      Assignments Overview
    </h1>
    
    {/* Analytics Button */}
    <Link href={'/dashboard/student/assignments/analytics'}>
    <button
      className="flex items-center gap-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
      onClick={() => console.log('Analytics clicked')}
    >
      <span className="material-symbols-outlined">analytics</span>
      Analytics
    </button>
    </Link>
  </div>
</div>


          {/* Controls: Search, Filters, View Toggle */}
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
                options={subjects}
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
          {filteredAssignments.length === 0 ? (
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