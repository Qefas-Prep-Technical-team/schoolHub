"use client";

import React, { useState, useMemo } from 'react';
import { useStudentTermResults } from '@/lib/api/hooks/useRecords';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from './Pagination';
import { cn } from '@/lib/utils';
import { Trophy, FileText, Zap } from 'lucide-react';

function getWAECGradeAndRemark(score: number): { grade: string, remark: string } {
  if (score >= 75) return { grade: 'A1', remark: 'EXCELLENT' };
  if (score >= 70) return { grade: 'B2', remark: 'VERY GOOD' };
  if (score >= 65) return { grade: 'B3', remark: 'GOOD' };
  if (score >= 60) return { grade: 'C4', remark: 'CREDIT' };
  if (score >= 55) return { grade: 'C5', remark: 'CREDIT' };
  if (score >= 50) return { grade: 'C6', remark: 'CREDIT' };
  if (score >= 45) return { grade: 'D7', remark: 'PASS' };
  if (score >= 40) return { grade: 'E8', remark: 'PASS' };
  return { grade: 'F9', remark: 'FAIL' };
}

export default function FinalResultsTab({ schoolId, primaryColor }: { schoolId: string, primaryColor: string }) {
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedFinalResult, setSelectedFinalResult] = useState<any>(null);

  const { data: finalResults, isLoading } = useStudentTermResults();
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none"
        >
          <option value="ALL">All Sessions</option>
          {sessions.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none"
        >
          <option value="ALL">All Terms</option>
          <option value="FIRST">First Term</option>
          <option value="SECOND">Second Term</option>
          <option value="THIRD">Third Term</option>
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none"
        >
          <option value="ALL">All Classes</option>
          {classes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        <div className="ml-auto text-sm font-bold text-slate-500">
          {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''} Found
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Final Result Grades</h3>
        </div>
        
        <div className="flex-1 overflow-x-auto p-4">
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
              {isLoading ? (
                <tr><td colSpan={6} className="p-6"><Skeleton className="h-10 w-full rounded-xl" /></td></tr>
              ) : paginatedResults.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No published final results found.</td></tr>
              ) : paginatedResults.map((result: any, index: number) => {
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
                  
                  const waec = getWAECGradeAndRemark(Number(percent));
                  grade = waec.grade;
                  remark = waec.remark;
                  
                  if (Number(percent) >= 75) { color = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400"; }
                  else if (Number(percent) >= 65) { color = "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"; }
                  else if (Number(percent) >= 50) { color = "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400"; }
                  else { color = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"; }
                }

                return (
                  <tr key={result.id} onClick={() => setSelectedFinalResult({ ...result, grade, remark, totalScore, percent, behavior, isRevealed, color })} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">{(page - 1) * itemsPerPage + index + 1}</span>
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
