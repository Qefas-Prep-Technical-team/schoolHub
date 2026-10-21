'use client';

import { useState, useMemo, useEffect } from 'react';
import AssignmentCard from './components/AssignmentCard';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import ViewToggle from './components/ViewToggle';
import { Assignment } from './components/types';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatsCards from './analytics/components/StatsCards';
import PerformanceChart from './analytics/components/PerformanceChart';
import SuggestedImprovements from './analytics/components/SuggestedImprovements';
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const statuses = ['All Statuses', 'Pending', 'Submitted', 'Graded', 'Overdue'];
const dueDates = ['All Dates', 'This Week', 'Next Week', 'This Month', 'Overdue'];

const parseGradeToPercentage = (gradeStr: string | null | undefined, maxMarks?: number): number | null => {
  if (!gradeStr) return null;
  if (gradeStr.includes('/')) {
    const [scorePart, totalPart] = gradeStr.split('/');
    const score = parseFloat(scorePart);
    const total = parseFloat(totalPart);
    if (!isNaN(score) && !isNaN(total) && total > 0) {
      return Math.round((score / total) * 100);
    }
  }
  const parsed = parseFloat(gradeStr.replace(/[^0-9.]/g, ''));
  if (isNaN(parsed)) return null;

  if (maxMarks && maxMarks > 0) {
    return Math.round((parsed / maxMarks) * 100);
  }
  
  return parsed;
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
  const ITEMS_PER_PAGE = 12;

  // Auto-default to grid on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const dynamicSubjects = useMemo(() => {
    const subjectNames = Array.from(new Set(assignments.map(a => a.subject || 'General')));
    return ['All Subjects', ...subjectNames];
  }, [assignments]);

  const dynamicDepartments = useMemo(() => {
    const departmentNames = Array.from(new Set(assignments.map(a => (a as any).department || 'Whole Class')));
    return ['All Departments', ...departmentNames];
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
      const numericGrade = parseGradeToPercentage(a.grade, (a as any).totalMarks);
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
      total,
      avgGrade,
      overdueCount: overdue.length,
      pendingCount: pending.length,
      gradedCount: graded.length,
      submittedCount: submitted.length,
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
        iconBgColor: 'bg-rose-100 dark:bg-rose-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
      });
    }
    if (computedStats.pendingCount > 0) {
      list.push({
        id: '2',
        title: 'Start Early on Pending Tasks',
        description: `You have ${computedStats.pendingCount} pending assignment${computedStats.pendingCount > 1 ? 's' : ''}. Working ahead reduces late submission risks.`,
        icon: 'schedule',
        iconBgColor: 'bg-amber-100 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
      });
    }
    if (computedStats.avgGrade > 0 && computedStats.avgGrade < 70) {
      list.push({
        id: '3',
        title: 'Target Weaker Concepts',
        description: 'Your assignment scores average below 70%. Review class notes or reach out to your instructor.',
        icon: 'menu_book',
        iconBgColor: 'bg-pink-100 dark:bg-pink-950/40',
        iconColor: 'text-pink-600 dark:text-pink-400',
      });
    }
    if (list.length === 0) {
      list.push({
        id: 'keepup',
        title: 'Keep Up the Excellent Work!',
        description: 'You have no pending or overdue assignments and your grades are outstanding. Keep it up!',
        icon: 'emoji_events',
        iconBgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
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
          const scoreVal = parseGradeToPercentage(a.grade, (a as any).totalMarks);
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

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.instructor || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Subject filter
      const matchesSubject = selectedSubject === 'All Subjects' || 
        (assignment.subject || 'General') === selectedSubject;

      // Status filter
      const matchesStatus = selectedStatus === 'All Statuses' || 
        assignment.status.toLowerCase() === selectedStatus.toLowerCase();

      // Due date filter
      const matchesDueDate = selectedDueDate === 'All Dates' || 
        (selectedDueDate === 'Overdue' && assignment.status === 'overdue');

      // Department filter
      const matchesDepartment = selectedDepartment === 'All Departments' || 
        ((assignment as any).department || 'Whole Class') === selectedDepartment;

      return matchesSearch && matchesSubject && matchesStatus && matchesDueDate && matchesDepartment;
    });
  }, [assignments, searchQuery, selectedSubject, selectedStatus, selectedDueDate, selectedDepartment]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedStatus, selectedDueDate, selectedDepartment]);

  const isAnyFilterActive = searchQuery !== '' || 
    selectedSubject !== 'All Subjects' || 
    selectedStatus !== 'All Statuses' || 
    selectedDueDate !== 'All Dates' || 
    selectedDepartment !== 'All Departments';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All Subjects');
    setSelectedStatus('All Statuses');
    setSelectedDueDate('All Dates');
    setSelectedDepartment('All Departments');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAssignments = filteredAssignments.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full space-y-5 sm:space-y-6 font-sans">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" />
            Student Academic Hub
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Assignments & Coursework
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your daily homework deadlines, submit online assignments, and inspect detailed evaluator remarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setIsAnalyticsOpen(true)}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs font-bold text-xs sm:text-sm gap-2 transition-all active:scale-95"
          >
            <BarChart3 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span>Academic Analytics</span>
          </Button>
        </div>
      </div>

      {/* Top Hero KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Total */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Total Assigned
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {computedStats.total}
            </p>
          </div>
        </div>

        {/* Card 2: Completed / Graded */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Graded Tasks
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {computedStats.gradedCount}
              </span>
              {computedStats.avgGrade > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ({computedStats.avgGrade}% avg)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Pending Work
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {computedStats.pendingCount}
            </p>
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${
            computedStats.overdueCount > 0 
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 animate-pulse' 
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Overdue Tasks
            </p>
            <p className={`text-lg sm:text-2xl font-black ${
              computedStats.overdueCount > 0 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-slate-900 dark:text-white'
            }`}>
              {computedStats.overdueCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-sm">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="flex-1 min-w-[240px]">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, subject, or instructor..."
            />
          </div>

          {/* View toggle (Grid vs List) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 md:hidden">
              Display Mode:
            </span>
            <ViewToggle 
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
        </div>

        {/* Filter chips track */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
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

          {isAnyFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-11 px-3 text-xs font-bold text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-2xl gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className={`grid gap-3.5 sm:gap-4 md:gap-5 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`rounded-2xl border border-slate-200 dark:border-slate-800 ${
                viewMode === 'grid' ? 'h-56' : 'h-24'
              }`} 
            />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 sm:p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
            No assignments found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
            {isAnyFilterActive 
              ? "No assignments match your active search or filter criteria. Try resetting filters."
              : "You have no active assignments right now. Check back later when your teachers post coursework."}
          </p>
          {isAnyFilterActive && (
            <Button
              onClick={resetAllFilters}
              className="rounded-xl bg-pink-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-pink-700 transition-colors shadow-2xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`grid gap-3.5 sm:gap-4 md:gap-5 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {paginatedAssignments.map((assignment, index) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                viewMode={viewMode}
                index={index + 1 + (safeCurrentPage - 1) * ITEMS_PER_PAGE}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-700 dark:text-slate-200">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredAssignments.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filteredAssignments.length}</span> assignments
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`h-9 min-w-[36px] px-2 rounded-xl text-xs font-bold transition-all ${
                        safeCurrentPage === idx + 1
                          ? "bg-pink-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Analytics Modal */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              Academic Performance Analytics
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
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
