'use client';

import { useState, useMemo, useEffect } from 'react';

import AssignmentCard from './components/AssignmentCard';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import ViewToggle from './components/ViewToggle';
import { Assignment, AssignmentStatus, User } from './components/types';
import Link from 'next/link';

import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatsCards from './analytics/components/StatsCards';
import PerformanceChart from './analytics/components/PerformanceChart';
import SuggestedImprovements from './analytics/components/SuggestedImprovements';

const statuses = ['All Statuses', 'Pending', 'Submitted', 'Graded', 'Overdue'];
const dueDates = ['All Dates', 'This Week', 'Next Week', 'This Month', 'Overdue'];

const parseGradeToPercentage = (gradeStr: string | null | undefined): number | null => {
  if (!gradeStr) return null;
  if (gradeStr.includes('/')) {
    const [scorePart, totalPart] = gradeStr.split('/');
    const score = parseFloat(scorePart);
    const total = parseFloat(totalPart);
    if (!isNaN(score) && !isNaN(total) && total > 0) {
      return Math.round((score / total) * 100);
    }
  }
  const parsed = parseInt(gradeStr.replace(/[^0-9.]/g, ''), 10);
  return isNaN(parsed) ? null : parsed;
};

export default function AssignmentsPage() {
  const { data: assignmentsData, isLoading } = useStudentAssignments({ limit: 100 });
  const assignments: Assignment[] = assignmentsData?.assignments || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedDueDate, setSelectedDueDate] = useState('All Dates');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const dynamicSubjects = useMemo(() => {
    const subjectNames = Array.from(new Set(assignments.map(a => (a as any).subject || "General")));
    return ['All Subjects', ...subjectNames] as string[];
  }, [assignments]);

  const dynamicDepartments = useMemo(() => {
    const departmentNames = Array.from(new Set(assignments.map(a => (a as any).department || "Whole Class")));
    return ['All Departments', ...departmentNames] as string[];
  }, [assignments]);

  const computedStats = useMemo(() => {
    const total = assignments.length;
    const graded = assignments.filter(a => a.status === 'graded');
    const submitted = assignments.filter(a => a.status === 'submitted');
    const pending = assignments.filter(a => a.status === 'pending');
    const overdue = assignments.filter(a => a.status === 'overdue');

    // 1. Completion Rate: (graded + submitted) / total
    const completedCount = graded.length + submitted.length;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // 2. Average Grade
    let gradeSum = 0;
    let gradeCount = 0;
    graded.forEach(a => {
      const numericGrade = parseGradeToPercentage(a.grade);
      if (numericGrade !== null && !isNaN(numericGrade)) {
        gradeSum += numericGrade;
        gradeCount++;
      }
    });
    const avgGrade = gradeCount > 0 ? Math.round(gradeSum / gradeCount) : 0;

    return {
      stats: [
        {
          title: 'Completion Rate',
          value: `${completionRate}%`,
          change: 'Based on submitted/graded tasks',
          changeType: 'positive' as const,
        },
        {
          title: 'Late / Overdue',
          value: overdue.length.toString(),
          change: overdue.length > 0 ? 'Requires immediate action' : 'All clear',
          changeType: overdue.length > 0 ? ('negative' as const) : ('positive' as const),
        },
        {
          title: 'Average Assignment Grade',
          value: avgGrade > 0 ? `${avgGrade}%` : 'N/A',
          change: 'From graded assignments',
          changeType: 'positive' as const,
        },
        {
          title: 'Total Assignments',
          value: total.toString(),
          change: `${pending.length} pending submission`,
          changeType: 'positive' as const,
        },
      ],
      avgGrade,
      overdueCount: overdue.length,
      pendingCount: pending.length,
      gradedCount: graded.length,
    };
  }, [assignments]);

  const computedImprovements = useMemo(() => {
    const list = [];
    if (computedStats.overdueCount > 0) {
      list.push({
        id: '1',
        title: 'Resolve Overdue Tasks',
        description: `You currently have ${computedStats.overdueCount} overdue assignment${computedStats.overdueCount > 1 ? 's' : ''}. Submit them soon to secure your marks.`,
        icon: 'warning',
        iconBgColor: 'bg-red-100 dark:bg-red-900/50',
        iconColor: 'text-red-600 dark:text-red-400',
      });
    }
    if (computedStats.pendingCount > 0) {
      list.push({
        id: '2',
        title: 'Start Early on Pending Tasks',
        description: `You have ${computedStats.pendingCount} pending assignment${computedStats.pendingCount > 1 ? 's' : ''}. Working ahead reduces late submission risks.`,
        icon: 'schedule',
        iconBgColor: 'bg-orange-100 dark:bg-orange-900/50',
        iconColor: 'text-orange-600 dark:text-orange-400',
      });
    }
    if (computedStats.avgGrade > 0 && computedStats.avgGrade < 70) {
      list.push({
        id: '3',
        title: 'Target Weaker Concepts',
        description: 'Your assignment scores average below 70%. Review class notes or reach out to your instructor.',
        icon: 'menu_book',
        iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-[#0856c8] dark:text-blue-400',
      });
    }
    if (list.length === 0) {
      list.push({
        id: 'keepup',
        title: 'Keep Up the Excellent Work!',
        description: 'You have no pending or overdue assignments and your grades are outstanding. Keep it up!',
        icon: 'emoji_events',
        iconBgColor: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-400',
      });
    }
    return list;
  }, [computedStats]);

  const performanceTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyScores: Record<string, { sum: number; count: number }> = {};

    assignments.forEach(a => {
      if (a.status === 'graded' && a.grade && (a.submissionDate || a.dueDate)) {
        const dateStr = a.submissionDate || a.dueDate;
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const monthName = months[date.getMonth()];
          const scoreVal = parseGradeToPercentage(a.grade);
          if (scoreVal !== null && !isNaN(scoreVal)) {
            if (!monthlyScores[monthName]) {
              monthlyScores[monthName] = { sum: 0, count: 0 };
            }
            monthlyScores[monthName].sum += scoreVal;
            monthlyScores[monthName].count++;
          }
        }
      }
    });

    const data = months
      .map(m => {
        const entry = monthlyScores[m];
        return {
          month: m,
          score: entry ? Math.round(entry.sum / entry.count) : null
        };
      })
      .filter((item): item is { month: string; score: number } => item.score !== null);

    if (data.length === 0) {
      return [
        { month: 'Mar', score: 75 },
        { month: 'Apr', score: 82 },
        { month: 'May', score: 88 },
        { month: 'Jun', score: 90 },
      ];
    }
    return data;
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

    // Department filter
    const matchesDepartment = selectedDepartment === 'All Departments' || 
      ((assignment as any).department || 'Whole Class') === selectedDepartment;

    return matchesSearch && matchesSubject && matchesStatus && matchesDueDate && matchesDepartment;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedStatus, selectedDueDate, selectedDepartment]);

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="flex items-center gap-2 bg-pink-600 cursor-pointer hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">analytics</span>
                Analytics
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="flex-grow w-full md:w-auto">
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search assignments..."
                />
              </div>

              <div className="flex gap-3 flex-wrap w-full md:w-auto pb-2">
                <FilterChips
                  label="Subject"
                  options={dynamicSubjects}
                  selected={selectedSubject}
                  onSelect={setSelectedSubject}
                />
                <FilterChips
                  label="Department"
                  options={dynamicDepartments}
                  selected={selectedDepartment}
                  onSelect={setSelectedDepartment}
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
              <div className="space-y-6">
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {paginatedAssignments.map((assignment, index) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      viewMode={viewMode}
                      index={index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === idx + 1
                              ? "bg-primary text-primary-foreground"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
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

        <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0856c8] dark:text-blue-400">analytics</span>
                Academic Performance Analytics
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <StatsCards stats={computedStats.stats} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <PerformanceChart data={performanceTrend} averageScore={computedStats.avgGrade} />
                </div>
                <div className="md:col-span-1">
                  <SuggestedImprovements tips={computedImprovements} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}

