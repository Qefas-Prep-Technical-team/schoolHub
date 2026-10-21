'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: 'graded' | 'submitted' | 'upcoming' | 'overdue';
  grade?: string;
  maxPoints?: number;
  type?: string;
  link?: string;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  hasDepartment: boolean;
  pageSize?: number;
}

export default function AssignmentsTable({
  assignments,
  hasDepartment,
  pageSize = 9,
}: AssignmentsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Detect mobile screens and default to grid view
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const availableTypes = useMemo(() => {
    const types = new Set(assignments.map(a => a.type || 'Assessment'));
    return ['ALL', ...Array.from(types)];
  }, [assignments]);

  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchType = typeFilter === 'ALL' || (a.type || 'Assessment').toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const getStatusBadgeStyle = (status: Assignment['status']) => {
    switch (status) {
      case 'graded':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-0">
        
        {/* Top Header / Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Assessments</h2>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">Showing {filtered.length} of {assignments.length} items</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  placeholder="Search assessments..." 
                  className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              {/* Grid / Table View Mode Switcher */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  type="button"
                  className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  type="button"
                  className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  title="Table View"
                  aria-label="Table View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter pills & dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <select 
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer shrink-0 shadow-2xs"
            >
              <option value="ALL">All Types</option>
              {availableTypes.filter(t => t !== 'ALL').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer shrink-0 shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="graded">Graded</option>
              <option value="submitted">Submitted</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>

            {(statusFilter !== 'ALL' || typeFilter !== 'ALL' || search) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); setSearch(''); setPage(1); }}
                className="h-9 text-xs font-bold text-pink-600 hover:text-pink-700 dark:text-pink-400 shrink-0"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content Body: Grid or Table */}
        {filtered.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 p-4 sm:p-6">
                {paginated.map((assignment, idx) => {
                  const isGraded = assignment.status === 'graded';
                  const isSubmitted = assignment.status === 'submitted';
                  const isUpcoming = assignment.status === 'upcoming';
                  const isOverdue = assignment.status === 'overdue';
                  const displayIndex = String((safePage - 1) * pageSize + idx + 1).padStart(2, '0');

                  return (
                    <div
                      key={assignment.id}
                      className="bg-slate-50/60 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-pink-500/40 group active:scale-[0.99]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2.5 mb-3">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs shrink-0 mt-0.5">
                              #{displayIndex}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base group-hover:text-pink-600 transition-colors line-clamp-2" title={assignment.title}>
                                {assignment.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  Due {assignment.dueDate}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="font-semibold text-slate-600 dark:text-slate-300">{assignment.type || 'Assessment'}</span>
                              </div>
                            </div>
                          </div>
                          <span className={cn("text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border shrink-0", getStatusBadgeStyle(assignment.status))}>
                            {assignment.status}
                          </span>
                        </div>

                        {/* Score / Status pill */}
                        <div className="flex items-center justify-between py-2 px-3 my-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          <span className="text-xs font-semibold text-slate-400">
                            {isGraded ? 'Score' : isSubmitted ? 'Status' : 'Submission'}
                          </span>
                          <div className="flex items-center gap-2">
                            {isGraded && assignment.grade ? (
                              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                                Grade: {assignment.grade}
                              </span>
                            ) : isSubmitted ? (
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                Submitted (Under Review)
                              </span>
                            ) : isOverdue ? (
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                Past Due Date
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                Upcoming Task
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        <span className="text-[11px] font-medium text-slate-400 truncate max-w-[140px]">
                          {isGraded ? 'Evaluated' : isSubmitted ? 'Pending Evaluation' : 'Action Required'}
                        </span>
                        {assignment.link && assignment.link !== '#' ? (
                          <Link href={assignment.link}>
                            <Button variant="outline" size="sm" className="h-8 text-pink-600 border-pink-200 hover:bg-pink-50 hover:text-pink-700 dark:border-pink-900/50 dark:hover:bg-pink-950/30 rounded-lg font-bold text-xs gap-1">
                              Preview
                              <ChevronRight size={13} />
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8 text-slate-400 border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs" disabled>
                            Preview
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                {/* Mobile Responsive List View */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {paginated.map((assignment, idx) => {
                    const displayIndex = String((safePage - 1) * pageSize + idx + 1).padStart(2, '0');
                    return (
                      <div key={assignment.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <span className="inline-flex items-center justify-center min-w-[28px] h-5 px-1 rounded font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
                              #{displayIndex}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                              {assignment.title}
                            </h4>
                          </div>
                          <span className={cn("text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border shrink-0", getStatusBadgeStyle(assignment.status))}>
                            {assignment.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pl-9">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {assignment.dueDate}
                          </span>
                          <div className="flex items-center gap-2">
                            {assignment.grade && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {assignment.grade}
                              </span>
                            )}
                            {assignment.link && assignment.link !== '#' ? (
                              <Link href={assignment.link}>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-pink-600 font-bold text-xs gap-0.5">
                                  Preview <ChevronRight size={12} />
                                </Button>
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Full Table View */}
                <div className="hidden md:block overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3.5 w-16">#</th>
                        <th className="px-4 py-3.5">Assessment</th>
                        <th className="px-4 py-3.5">Type</th>
                        <th className="px-4 py-3.5">Due Date</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-center">Grade</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {paginated.map((assignment, idx) => {
                        const displayIndex = String((safePage - 1) * pageSize + idx + 1).padStart(2, '0');
                        return (
                          <tr key={assignment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                #{displayIndex}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200">
                              {assignment.title}
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                              {assignment.type || 'Assessment'}
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                              {assignment.dueDate}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border", getStatusBadgeStyle(assignment.status))}>
                                {assignment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200 text-center">
                              {assignment.grade || '-'}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end">
                                {assignment.link && assignment.link !== '#' ? (
                                  <Link href={assignment.link}>
                                    <Button variant="outline" size="sm" className="h-8 text-pink-600 border-pink-200 hover:bg-pink-50 hover:text-pink-700 dark:border-pink-900/50 dark:hover:bg-pink-950/30 rounded-lg font-bold text-xs gap-1">
                                      Preview
                                      <ChevronRight size={13} />
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button variant="outline" size="sm" className="h-8 text-slate-400 border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs" disabled>
                                    Preview
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">
                {startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="h-8 px-2 text-slate-400">
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">Page {safePage} of {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-8 px-2 text-slate-400">
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-800 dark:text-white font-bold text-base mb-1">No Assessments Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no assessments matching your current search or filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}