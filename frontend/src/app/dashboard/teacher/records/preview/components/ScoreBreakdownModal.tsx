"use client";

import { X, Loader2 } from "lucide-react";
import { useStudentScoreBreakdown } from "@/lib/api/hooks/useRecords";

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  studentId: string;
  studentName: string;
  category: "ca" | "quiz" | "exam" | "assignment" | null;
  categoryMax: number | null;
}

export function ScoreBreakdownModal({
  isOpen,
  onClose,
  resultId,
  studentId,
  studentName,
  category,
  categoryMax
}: ScoreBreakdownModalProps) {
  const { data: breakdownData, isLoading } = useStudentScoreBreakdown(isOpen ? resultId : undefined, isOpen ? studentId : undefined);

  if (!isOpen || !category) return null;

  const items = breakdownData?.breakdown?.[category] || [];
  const sources = breakdownData?.sources || {};
  const currentSource = sources[category] || "Manual Entry"; // Default to Manual Entry

  const totalPossible = items.reduce((sum: number, item: any) => sum + (item.maxScore || 0), 0);
  const totalScored = items.reduce((sum: number, item: any) => sum + (item.score || 0), 0);
  
  const scaledScore = totalPossible > 0 && categoryMax 
    ? ((totalScored / totalPossible) * categoryMax).toFixed(2) 
    : "0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1b2e] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {category.toUpperCase()} Breakdown
            </h3>
            <p className="text-sm text-slate-500">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm">Loading breakdown...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Score Source:</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentSource === "SYNC" ? "Synced Subject Papers" : 
                   currentSource === "CSV" ? "CSV Upload" : 
                   currentSource === "AI" ? "AI Image Extraction" : 
                   "Manual Entry"}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">No linked papers for this category.</p>
                </div>
              ) : (
                <>
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.paperName}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.score !== null ? item.score : "-"}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          / {item.maxScore}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Raw Total:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{totalScored} / {totalPossible}</span>
                    </div>
                    {categoryMax != null && (
                      <div className="flex justify-between items-center text-[#10b981]">
                        <span className="text-sm font-bold">Scaled Score (Max {categoryMax}):</span>
                        <span className="text-lg font-black">{scaledScore}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
