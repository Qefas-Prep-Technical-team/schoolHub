"use client";

import React, { useState, useMemo } from "react";
import { FileText, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { useChildResults, useParentChildren } from "@/lib/api/hooks/useParentChildren";
import { useParentStore } from "@/lib/api/hooks/useParentStore";

function getWAECGradeAndRemark(score: number): { grade: string; remark: string } {
  if (score >= 75) return { grade: "A1", remark: "EXCELLENT" };
  if (score >= 70) return { grade: "B2", remark: "VERY GOOD" };
  if (score >= 65) return { grade: "B3", remark: "GOOD" };
  if (score >= 60) return { grade: "C4", remark: "CREDIT" };
  if (score >= 55) return { grade: "C5", remark: "CREDIT" };
  if (score >= 50) return { grade: "C6", remark: "CREDIT" };
  if (score >= 45) return { grade: "D7", remark: "PASS" };
  if (score >= 40) return { grade: "E8", remark: "PASS" };
  return { grade: "F9", remark: "FAIL" };
}

export default function FinalResults() {
  const { selectedChildId } = useParentStore();
  const { data: children } = useParentChildren();
  const selectedChild = children?.find((c: any) => c.id === selectedChildId);

  const { data: finalResultsRes, isLoading } = useChildResults(selectedChildId);

  const [selectedTerm, setSelectedTerm] = useState<string>("ALL");
  const [selectedSession, setSelectedSession] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const itemsPerPage = 8;

  const finalResults = finalResultsRes || [];

  const allSubjects = useMemo(() => {
    const subjects: any[] = [];
    (Array.isArray(finalResults) ? finalResults : []).forEach((group: any) => {
      if (group && group.subjectResults) {
        subjects.push(...group.subjectResults);
      }
    });
    return subjects;
  }, [finalResults]);

  const sessionOptions = useMemo(() => {
    const seen = new Map<string, string>();
    allSubjects.forEach((r) => {
      if (r.sessionId && r.session?.name && !seen.has(r.sessionId)) {
        seen.set(r.sessionId, r.session.name);
      }
    });
    return Array.from(seen.entries());
  }, [allSubjects]);

  const filteredResults = useMemo(() => {
    let filtered = allSubjects;
    if (selectedSession !== "ALL") filtered = filtered.filter((r: any) => r.sessionId === selectedSession);
    if (selectedTerm !== "ALL") filtered = filtered.filter((r: any) => r.term === selectedTerm);
    return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allSubjects, selectedSession, selectedTerm]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(start, start + itemsPerPage);
  }, [filteredResults, currentPage]);

  const handleFilterChange = (type: "session" | "term", value: string) => {
    setCurrentPage(1);
    if (type === "session") setSelectedSession(value);
    else setSelectedTerm(value);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={20} className="text-purple-200" />
            <span className="text-sm font-semibold text-purple-200">Final Result Grades</span>
          </div>
          <h2 className="text-2xl font-bold">
            {selectedChild ? `${selectedChild.name}'s Results` : "Child's Results"}
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            {filteredResults.length} subject{filteredResults.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <select
            value={selectedSession}
            onChange={(e) => handleFilterChange("session", e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:border-white/50 cursor-pointer"
          >
            <option value="ALL" className="text-slate-800">All Sessions</option>
            {sessionOptions.map(([id, name]) => (
              <option key={id} value={id} className="text-slate-800">{name}</option>
            ))}
          </select>
          <select
            value={selectedTerm}
            onChange={(e) => handleFilterChange("term", e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:border-white/50 cursor-pointer"
          >
            {["ALL", "FIRST", "SECOND", "THIRD"].map((t) => (
              <option key={t} value={t} className="text-slate-800">
                {t === "ALL" ? "All Terms" : `${t} TERM`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                <th className="px-5 py-4 w-14">#</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Class</th>
                <th className="px-5 py-4">Term</th>
                <th className="px-5 py-4 text-center">Score</th>
                <th className="px-5 py-4">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-10 w-full rounded-xl" /></td></tr>
                ))
              ) : !selectedChildId ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="text-slate-400" size={22} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Please select a child to view their results.</p>
                  </td>
                </tr>
              ) : paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="text-purple-400" size={22} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">No published final results found.</p>
                    <p className="text-slate-400 text-xs mt-1">Results appear here once released by the school.</p>
                  </td>
                </tr>
              ) : paginatedResults.map((result: any, index: number) => {
                const behavior = (result.scoreSources || {}).behavior || {};
                const isRevealed = result.scoresRevealed;
                let totalScore: number | string = "-";
                let grade = "-";
                let color = "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400";

                if (isRevealed) {
                  totalScore = (result.assignmentScore || 0) + (result.quizScore || 0) + (result.caScore || 0) + (result.examScore || 0);
                  const waec = getWAECGradeAndRemark(Number(totalScore));
                  grade = waec.grade;
                  if (Number(totalScore) >= 75) color = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400";
                  else if (Number(totalScore) >= 65) color = "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400";
                  else if (Number(totalScore) >= 50) color = "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400";
                  else color = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400";
                }

                return (
                  <tr
                    key={result.id}
                    onClick={() => setSelectedResult({ ...result, grade, totalScore, behavior, isRevealed })}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
                  >
                    <td className="px-5 py-5 text-sm font-semibold text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{result.resultName || result.subject?.name || "Unknown"}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{result.subject?.name}{result.subject?.code ? ` • ${result.subject.code}` : ""}</div>
                    </td>
                    <td className="px-5 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">{result.class?.name || "—"}</td>
                    <td className="px-5 py-5">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{result.term} TERM</div>
                      <div className="text-xs text-slate-400">{result.session?.name}</div>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm mb-1", color)}>{grade}</span>
                        {isRevealed ? (
                          <span className="font-bold text-slate-800 dark:text-white text-xs">{totalScore}%</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-5 text-xs text-slate-500 space-y-1">
                      <div>Politeness: <span className="font-semibold text-slate-700 dark:text-slate-300">{isRevealed ? (behavior.politeness || "-") : "-"}</span>/5</div>
                      <div>Punctuality: <span className="font-semibold text-slate-700 dark:text-slate-300">{isRevealed ? (behavior.punctuality || "-") : "-"}</span>/5</div>
                      <div>Handwriting: <span className="font-semibold text-slate-700 dark:text-slate-300">{isRevealed ? (behavior.handwriting || "-") : "-"}</span>/5</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-center">
            <Pagination theme="pink" currentPage={currentPage} totalPages={totalPages} totalItems={filteredResults.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedResult(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedResult.resultName || selectedResult.subject?.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{selectedResult.subject?.name} • {selectedResult.term} TERM • {selectedResult.session?.name}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-purple-600 bg-purple-50 dark:bg-purple-900/30 font-black text-lg border border-purple-100 dark:border-purple-900/50">
                {selectedResult.isRevealed ? selectedResult.grade : "—"}
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Score breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Score Distribution</h4>
                <div className="space-y-3">
                  {[
                    { label: "Assignment", value: selectedResult.assignmentScore },
                    { label: "Quiz", value: selectedResult.quizScore },
                    { label: "Continuous Assessment", value: selectedResult.caScore },
                    { label: "Examination", value: selectedResult.examScore },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedResult.isRevealed ? (value || 0) : "—"}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Total Score</span>
                    <span className="font-black text-purple-600 text-lg">{selectedResult.isRevealed ? `${selectedResult.totalScore}%` : "Pending"}</span>
                  </div>
                </div>
              </div>

              {/* Behavior & Remarks */}
              <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100/50 dark:border-purple-900/20">
                <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">Behavior &amp; Remarks</h4>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Politeness", value: selectedResult.behavior?.politeness },
                    { label: "Punctuality", value: selectedResult.behavior?.punctuality },
                    { label: "Handwriting", value: selectedResult.behavior?.handwriting },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white dark:bg-slate-900 rounded-lg p-2 text-center shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</div>
                      <div className="font-bold text-slate-700 dark:text-slate-300">{selectedResult.isRevealed ? (value || "—") : "—"}</div>
                    </div>
                  ))}
                </div>
                {selectedResult.isRevealed && selectedResult.behavior?.teacherRemark && (
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teacher&apos;s Remark</span>
                    <p className="text-sm italic text-slate-700 dark:text-slate-300">&quot;{selectedResult.behavior.teacherRemark}&quot;</p>
                  </div>
                )}
                {selectedResult.isRevealed && selectedResult.behavior?.principalRemark && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Principal&apos;s Remark</span>
                    <p className="text-sm italic text-slate-700 dark:text-slate-300">&quot;{selectedResult.behavior.principalRemark}&quot;</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedResult(null)}
              className="mt-5 w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
