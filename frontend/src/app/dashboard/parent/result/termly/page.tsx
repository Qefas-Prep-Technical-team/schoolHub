"use client";

import { useState, useEffect } from "react";
import { useChildResults, useParentChildren } from "@/lib/api/hooks/useParentChildren";
import { useParentStore } from "@/lib/api/hooks/useParentStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, ChevronRight, CheckCircle2, Clock, Eye, LayoutGrid, List, Search } from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/parent/components/dashboard/HeaderTooltip";
import { cn } from "@/lib/utils";

function getTermLabel(term: string): string {
  const map: Record<string, string> = { FIRST: "1st Term", SECOND: "2nd Term", THIRD: "3rd Term" };
  return map[term] || term;
}

function getTermGradient(term: string): string {
  const map: Record<string, string> = { FIRST: "from-violet-600 to-indigo-600", SECOND: "from-rose-500 to-pink-600", THIRD: "from-amber-500 to-orange-500" };
  return map[term] || "from-slate-600 to-slate-700";
}

function getTermAccent(term: string): string {
  const map: Record<string, string> = {
    FIRST: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300",
    SECOND: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300",
    THIRD: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  };
  return map[term] || "bg-slate-50 border-slate-200 text-slate-700";
}

function StatusBadge({ subjectCount, revealedCount }: { subjectCount: number, revealedCount: number }) {
  if (revealedCount === subjectCount) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-full px-2.5 py-1 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span>All scores released</span>
      </div>
    );
  }
  if (revealedCount > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-full px-2.5 py-1 font-semibold">
        <Eye className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{subjectCount - revealedCount > 0 ? `${subjectCount - revealedCount} hidden` : "Scores pending"}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-full px-2.5 py-1 font-semibold">
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Scores not yet released</span>
    </div>
  );
}

function ResultGroupCard({ group, idx, childId }: { group: any, idx: number, childId: string }) {
  const router = useRouter();
  const gradient = getTermGradient(group.term);
  const accentClass = getTermAccent(group.term);
  const { subjectCount, revealedCount } = group;

  const handleView = () => {
    const params = new URLSearchParams({ sessionId: group.sessionId, term: group.term, childId });
    router.push('/dashboard/parent/result/termly/view?' + params.toString());
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={handleView}
      role="button"
      tabIndex={0}
      id={'result-group-card-' + idx}
      onKeyDown={(e) => e.key === 'Enter' && handleView()}
    >
      <div>
        <div className={'h-1.5 bg-gradient-to-r ' + gradient} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-500 flex items-center justify-center">
                #{idx + 1}
              </span>
              <span className={'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ' + accentClass}>
                {getTermLabel(group.term)}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">{group.class?.name || "Class"}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">{group.session?.name || '—'}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{subjectCount}</span>
              <span>subject{subjectCount !== 1 ? 's' : ''}</span>
            </div>
            <StatusBadge subjectCount={subjectCount} revealedCount={revealedCount} />
          </div>
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {revealedCount === subjectCount ? 'Full results available' : 'View subject breakdown'}
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Result <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

export default function ParentResultListPage() {
  const router = useRouter();
  const { selectedChildId, setSelectedChildId } = useParentStore();
  const { data: children = [] } = useParentChildren();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const { data: results = [], isLoading } = useChildResults(selectedChildId ?? "");

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('all');

  // Auto-select first child if none is selected
  useEffect(() => {
    if (!selectedChildId && children && children.length > 0) {
      setSelectedChildId(children[0].id);
    }
  }, [selectedChildId, children, setSelectedChildId]);

  const groups = Array.isArray(results) ? results : [];

  const filteredGroups = groups.filter((g: any) => {
    const matchesTerm = selectedTerm === 'all' || g.term === selectedTerm;
    const sessionMatch = g.session?.name ? g.session.name.toLowerCase().includes(search.toLowerCase()) : false;
    const classMatch = g.class?.name ? g.class.name.toLowerCase().includes(search.toLowerCase()) : false;
    const termLabelMatch = getTermLabel(g.term).toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search || sessionMatch || classMatch || termLabelMatch;
    return matchesTerm && matchesSearch;
  });

  const handleOpenResult = (group: any) => {
    if (!selectedChildId) return;
    const params = new URLSearchParams({ sessionId: group.sessionId, term: group.term, childId: selectedChildId });
    router.push('/dashboard/parent/result/termly/view?' + params.toString());
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 w-full space-y-5">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-5 w-80 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!selectedChildId && children.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">Academic Results</h1>
        <p className="text-slate-500 mb-10">Select a child from the dashboard to view their results.</p>
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No Child Linked</h2>
          <p className="text-slate-400 text-sm text-center max-w-xs">Please link your child or select them from the dashboard first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedChild ? `${selectedChild.name}'s Results` : 'Academic Results'}
                </h1>
                <HeaderTooltip
                  content="This portal presents verified official termly academic result sheets for your child. Each record aggregates terminal examinations, quizzes, assignments, and continuous assessment scores into official grade transcripts. Use this page to track term-by-term performance trajectories, view released report cards, and monitor upcoming score publication dates."
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {groups.length} published termly report card{groups.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Grid / List View Toggle (Grid is default) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'grid'
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'list'
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Child Switcher (if multiple children exist) */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Student:
          </span>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                selectedChildId === child.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
              )}
            >
              <span>{child.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by session, class or term..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border-none rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border-none rounded-xl py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="all">All Terms</option>
            <option value="FIRST">1st Term</option>
            <option value="SECOND">2nd Term</option>
            <option value="THIRD">3rd Term</option>
          </select>
        </div>
      </div>

      {/* Content Rendering: Grid vs List */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">
            {groups.length === 0 ? "No Results Published Yet" : "No Matching Results"}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm text-center max-w-sm">
            {groups.length === 0
              ? "Official terminal result sheets will appear here once finalized and published by the school administration."
              : "Try adjusting your search query or term filter to find what you are looking for."}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View (Default) */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-300">
          {filteredGroups.map((group, idx) => (
            <ResultGroupCard
              key={`${group.sessionId}-${group.term}-${idx}`}
              group={group}
              idx={idx}
              childId={selectedChildId ?? ""}
            />
          ))}
        </div>
      ) : (
        /* List / Table View with Numbering */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="px-3 sm:px-4 py-4 w-12 text-center">#</th>
                  <th className="px-4 sm:px-6 py-4">Academic Term</th>
                  <th className="px-4 sm:px-6 py-4">Session</th>
                  <th className="px-4 sm:px-6 py-4">Class</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Subjects</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Score Status</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredGroups.map((group: any, idx: number) => {
                  const accentClass = getTermAccent(group.term);
                  return (
                    <tr
                      key={`${group.sessionId}-${group.term}-${idx}`}
                      onClick={() => handleOpenResult(group)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Row Number */}
                      <td className="px-3 sm:px-4 py-4 text-center font-bold text-xs text-slate-400 dark:text-slate-500 w-12">
                        {idx + 1}
                      </td>

                      {/* Term */}
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accentClass}`}>
                          {getTermLabel(group.term)}
                        </span>
                      </td>

                      {/* Session */}
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {group.session?.name || "—"}
                      </td>

                      {/* Class */}
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                        {group.class?.name || "Class"}
                      </td>

                      {/* Subjects Count */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                          <BookOpen className="w-3.5 h-3.5" />
                          {group.subjectCount} Subject{group.subjectCount !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <StatusBadge subjectCount={group.subjectCount} revealedCount={group.revealedCount} />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenResult(group)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 transition-all"
                        >
                          View Result
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
