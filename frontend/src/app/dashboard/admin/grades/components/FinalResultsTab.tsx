"use client";

import React, { useState, useMemo } from 'react';
import { useStudentTermResults } from '@/lib/api/hooks/useRecords';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { getGradeEvaluation } from '@/utils/gradingSystem';
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from './Pagination';
import { cn } from '@/lib/utils';
import { Trophy, FileText, Zap, LayoutGrid, List } from 'lucide-react';
import { groupByDate } from '../utils/dateSectioning';

export default function FinalResultsTab({ schoolId, primaryColor }: { schoolId: string, primaryColor: string }) {
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedFinalResult, setSelectedFinalResult] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Default to grid on mobile
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const { data: finalResults, isLoading } = useStudentTermResults();
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: sessionsRes } = useSessions(schoolId);
  const { data: classesRes } = useClasses(schoolId);

  const sessions = sessionsRes?.data || (Array.isArray(sessionsRes) ? sessionsRes : []);
  const classes = classesRes?.data || (Array.isArray(classesRes) ? classesRes : []);

  const filteredResults = useMemo(() => {
    let allSubjects: any[] = [];
    (finalResults || []).forEach((group: any) => {
      if (group && group.subjectResults) {
        group.subjectResults.forEach((sub: any) => {
          allSubjects.push({
            ...sub,
            student: group.student,
            class: group.class,
            session: group.session,
            term: group.term,
            scoresRevealed: group.scoresRevealed,
          });
        });
      }
    });

    return allSubjects.filter(r => {
      if (selectedSession !== 'ALL' && r.session?.id !== selectedSession) return false;
      if (selectedTerm !== 'ALL' && r.term !== selectedTerm) return false;
      if (selectedClass !== 'ALL' && r.class?.id !== selectedClass) return false;
      return true;
    }).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [finalResults, selectedSession, selectedTerm, selectedClass]);

  const pagination = {
    total: filteredResults.length,
    totalPages: Math.ceil(filteredResults.length / itemsPerPage)
  };

  const paginatedResults = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, page, itemsPerPage]);

  const finalResultGroups = useMemo(() => {
    return groupByDate(
      paginatedResults.map((result: any, idx: number) => ({
        result,
        globalIndex: (page - 1) * itemsPerPage + idx + 1,
      })),
      (item) => item.result.createdAt || item.result.updatedAt
    );
  }, [paginatedResults, page, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Sessions</option>
            {sessions.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Terms</option>
            <option value="FIRST">First Term</option>
            <option value="SECOND">Second Term</option>
            <option value="THIRD">Third Term</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {filteredResults.length} {filteredResults.length === 1 ? 'Record' : 'Records'} Found
          </span>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", viewMode === 'grid' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-400 hover:text-slate-600")}
              title="Grid View"
            >
              <LayoutGrid size={15} strokeWidth={2.5} />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", viewMode === 'list' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-400 hover:text-slate-600")}
              title="List View"
            >
              <List size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
        
        <div className="flex-1 overflow-x-auto p-4">
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {isLoading ? (
                <div className="p-6"><Skeleton className="h-10 w-full rounded-xl" /></div>
              ) : paginatedResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">No published final results found.</div>
              ) : (
                finalResultGroups.map((section) => (
                  <div key={section.label} className="space-y-3">
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="size-2 rounded-full bg-indigo-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {section.label}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                        {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                            <th className="px-6 py-4 pb-4 w-16">#</th>
                            <th className="px-6 py-4 pb-4">Student</th>
                            <th className="px-6 py-4 pb-4">Subject</th>
                            <th className="px-6 py-4 pb-4">Class</th>
                            <th className="px-6 py-4 pb-4">Term</th>
                            <th className="px-6 py-4 pb-4 text-center">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {section.items.map(({ result, globalIndex }) => {
                            const scoreSources = result.scoreSources || {};
                            const behavior = scoreSources.behavior || {};
                            
                            const isRevealed = result.scoresRevealed;
                            
                            let totalScore: number | string = '-';
                            let percent: number | string = '-';
                            let grade = "-";
                            let remark = "-";
                            let color = "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"; 
                            
                            if (isRevealed) {
                              totalScore = (result.assignmentScore || 0) + (result.quizScore || 0) + (result.caScore || 0) + (result.examScore || 0);
                              percent = result.classSubjectResult?.examMax ? Math.round((Number(totalScore) / 100) * 100) : totalScore;
                              
                              const evalResult = getGradeEvaluation(Number(percent), schoolProfile?.gradingSystem);
                              grade = evalResult.grade;
                              remark = evalResult.remark;
                              color = `${evalResult.bg} ${evalResult.color}`;
                            }

                            return (
                              <tr key={result.id} onClick={() => setSelectedFinalResult({ ...result, grade, remark, totalScore, percent, behavior, isRevealed, color })} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer">
                                <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">#{globalIndex}</span>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="font-bold text-slate-800 dark:text-white text-base line-clamp-1">{result.student?.name || 'Unknown Student'}</div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="font-bold text-slate-800 dark:text-white text-base line-clamp-1">{result.resultName || result.subject?.name || 'Unknown'}</div>
                                  <div className="text-xs font-medium text-slate-400 mt-0.5">{result.subject?.name} • {result.subject?.code}</div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                  {result.class?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-5">
                                  <div className="font-semibold text-slate-700 dark:text-slate-200">{result.term} TERM</div>
                                  <div className="text-xs text-slate-400">{result.session?.name}</div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <span className={cn("px-3 py-1 rounded-md text-xs font-black tracking-wider shadow-sm border border-transparent dark:border-white/5", color)}>
                                      {isRevealed ? `${percent}% • ${grade}` : 'HIDDEN'}
                                    </span>
                                    {isRevealed && (
                                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{remark}</span>
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
                ))
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
                </div>
              ) : paginatedResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">No published final results found.</div>
              ) : (
                finalResultGroups.map((section) => (
                  <div key={section.label} className="space-y-4">
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="size-2 rounded-full bg-indigo-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {section.label}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                        {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {section.items.map(({ result }) => {
                        const scoreSources = result.scoreSources || {};
                        const behavior = scoreSources.behavior || {};
                        
                        const isRevealed = result.scoresRevealed;
                        
                        let totalScore: number | string = '-';
                        let percent: number | string = '-';
                        let grade = "-";
                        let remark = "-";
                        let color = "text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"; 
                        
                        if (isRevealed) {
                          totalScore = (result.assignmentScore || 0) + (result.quizScore || 0) + (result.caScore || 0) + (result.examScore || 0);
                          percent = result.classSubjectResult?.examMax ? Math.round((Number(totalScore) / 100) * 100) : totalScore;
                          
                          const evalResult = getGradeEvaluation(Number(percent), schoolProfile?.gradingSystem);
                          grade = evalResult.grade;
                          remark = evalResult.remark;
                          color = `${evalResult.bg} ${evalResult.color}`;
                        }

                        return (
                          <div 
                            key={result.id} 
                            onClick={() => setSelectedFinalResult({ ...result, grade, remark, totalScore, percent, behavior, isRevealed, color })} 
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group cursor-pointer"
                          >
                            <div>
                              {/* Header: Class & Grade Pill */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80">
                                  {result.class?.name || 'Class'}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {isRevealed ? (
                                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider border", color)}>
                                      Grade {grade}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Student Name */}
                              <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {result.student?.name || 'Unknown Student'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                  {result.subject?.name || result.resultName || 'Subject'}
                                </span>
                                <span>•</span>
                                <span className="truncate">{result.term} Term</span>
                                <span>•</span>
                                <span className="truncate">{result.session?.name || 'Session'}</span>
                              </div>

                              {/* Metric breakdown */}
                              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium">Cumulative Total:</span>
                                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                    {isRevealed ? `${percent}%` : '---'}
                                  </span>
                                </div>

                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-indigo-600 h-full rounded-full"
                                    style={{ width: `${isRevealed && typeof percent === 'number' ? Math.min(100, Math.max(0, percent)) : 0}%` }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                  <span>Remark: <strong className="text-slate-600 dark:text-slate-300">{remark}</strong></span>
                                  <span>{isRevealed ? `${totalScore} pts` : 'Hidden'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                View Full Breakdown
                              </span>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                                Details
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {pagination && pagination.total > 0 && (
          <div className="p-4 flex justify-center border-t border-slate-100 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900">
            <Pagination currentPage={page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={itemsPerPage} onPageChange={setPage} />
          </div>
        )}
      </div>

      {selectedFinalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedFinalResult(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedFinalResult.resultName || selectedFinalResult.subject?.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{selectedFinalResult.student?.name} • {selectedFinalResult.term} TERM • {selectedFinalResult.session?.name}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex flex-col items-center justify-center font-black text-lg shadow-inner", selectedFinalResult.color)}>
                {selectedFinalResult.isRevealed ? selectedFinalResult.grade : '-'}
              </div>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Score Distribution</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Assignment</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedFinalResult.isRevealed ? (selectedFinalResult.assignmentScore || 0) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Quiz</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedFinalResult.isRevealed ? (selectedFinalResult.quizScore || 0) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Continuous Assessment</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedFinalResult.isRevealed ? (selectedFinalResult.caScore || 0) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Examination</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedFinalResult.isRevealed ? (selectedFinalResult.examScore || 0) : '-'}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                    <span className="text-slate-900 dark:text-white font-bold">Total Score</span>
                    <span className="font-black text-lg text-slate-900 dark:text-white">{selectedFinalResult.isRevealed ? selectedFinalResult.totalScore : '-'}</span>
                  </div>
                </div>
              </div>

              {selectedFinalResult.remark && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Teacher's Remark</h4>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300">"{selectedFinalResult.remark}"</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedFinalResult(null)}
              className="mt-6 w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
