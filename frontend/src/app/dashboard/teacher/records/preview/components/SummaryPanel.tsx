"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertCircle, BarChart3, FileText, ClipboardCheck, BookOpen, PenTool } from "lucide-react";
import { useState } from "react";
import { PaperScoresModal } from "./PaperScoresModal";

interface SummaryPanelProps {
  students: any[];
  config: any;
  subjectPapers: any[];
  assignments: any[];
  hidePapers?: boolean;
}

export function SummaryPanel({ students, config, subjectPapers, assignments, hidePapers }: SummaryPanelProps) {
  const summary = useMemo(() => {
    const totalStudents = students.length;
    if (totalStudents === 0) return null;

    let academicFilled = 0;
    let behavioralFilled = 0;
    let remarksFilled = 0;
    
    let totalScoreSum = 0;
    let totalMaxPossibleSum = (config?.assignmentMax || 0) + (config?.quizMax || 0) + (config?.caMax || 0) + (config?.examMax || 0);

    students.forEach(s => {
      // Academic
      let studentTotal = 0;
      let hasAcademic = false;
      if (s.assignment !== "" && s.assignment !== "0") { hasAcademic = true; studentTotal += parseFloat(s.assignment) || 0; }
      if (s.quiz !== "" && s.quiz !== "0") { hasAcademic = true; studentTotal += parseFloat(s.quiz) || 0; }
      if (s.ca !== "" && s.ca !== "0") { hasAcademic = true; studentTotal += parseFloat(s.ca) || 0; }
      if (s.exam !== "" && s.exam !== "0") { hasAcademic = true; studentTotal += parseFloat(s.exam) || 0; }
      if (hasAcademic) academicFilled++;
      
      totalScoreSum += studentTotal;

      // Behavioral
      if (s.politeness !== "0" || s.punctuality !== "0" || s.handwriting !== "0") {
        behavioralFilled++;
      }

      // Remarks
      if (s.teacherRemark || s.principalRemark) {
        remarksFilled++;
      }
    });

    const averagePercentage = totalMaxPossibleSum > 0 && totalStudents > 0
      ? ((totalScoreSum / totalStudents) / totalMaxPossibleSum) * 100
      : 0;

    const getPapers = (ids: string[], type: "paper" | "assignment") => {
      if (!ids || ids.length === 0) return [];
      if (type === "paper") {
        return ids.map(id => {
          const title = config?.paperLinkDetails?.papers?.find((p:any) => p.id === id)?.title 
            || subjectPapers.find(p => p.id === id)?.title 
            || "Linked Paper";
          return { id, title, type };
        });
      } else {
        return ids.map(id => {
          const title = config?.paperLinkDetails?.assignments?.find((a:any) => a.id === id)?.title 
            || assignments.find(a => a.id === id)?.title 
            || "Linked Assignment";
          return { id, title, type };
        });
      }
    };

    const linkedPapers = {
      assignment: getPapers(config?.paperLinks?.assignment, "assignment"),
      quiz: getPapers(config?.paperLinks?.subjectPaper, "paper"),
      ca: getPapers(config?.paperLinks?.ca, "paper"),
      exam: getPapers(config?.paperLinks?.exam, "paper"),
    };

    return {
      totalStudents,
      academicFilled,
      behavioralFilled,
      remarksFilled,
      averagePercentage: averagePercentage.toFixed(1),
      linkedPapers
    };
  }, [students, config, subjectPapers, assignments]);

  const [selectedPaper, setSelectedPaper] = useState<{id: string, title: string, type: "paper" | "assignment"} | null>(null);

  if (!summary) return null;

  const renderPaperList = (papers: {id: string, title: string, type: string}[]) => {
    if (papers.length === 0) return <p className="text-sm font-medium text-slate-400">None</p>;
    return (
      <div className="flex flex-wrap gap-1">
        {papers.map((p) => (
          <button 
            key={p.id}
            onClick={() => setSelectedPaper(p as any)}
            className="text-xs font-medium text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/20 px-2 py-1 rounded truncate transition-colors max-w-full"
            title={p.title}
          >
            {p.title}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Paper Scores Modal */}
      {selectedPaper && (
        <PaperScoresModal 
          isOpen={!!selectedPaper} 
          onClose={() => setSelectedPaper(null)} 
          paperId={selectedPaper.id}
          paperTitle={selectedPaper.title}
          type={selectedPaper.type}
          schoolId={config?.schoolId}
          currentStudentIds={students.map(s => s.id)}
        />
      )}
      
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#10b981]" />
          Page Summary
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {/* Linked Papers Summary */}
        {!hidePapers && (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Papers Making Up Result
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Assignment Linked:</p>
              {renderPaperList(summary.linkedPapers.assignment)}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Quiz/Test Linked:</p>
              {renderPaperList(summary.linkedPapers.quiz)}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">CA Linked:</p>
              {renderPaperList(summary.linkedPapers.ca)}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Exam Linked:</p>
              {renderPaperList(summary.linkedPapers.exam)}
            </div>
          </div>
        </div>
        )}

        {/* Academic Stats */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Academic Scores</h4>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {summary.academicFilled} <span className="text-sm font-normal text-slate-500">/ {summary.totalStudents} students</span>
          </p>
          <div className="mt-2 text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md inline-block w-fit border border-slate-100 dark:border-slate-700">
            Class Avg: <span className="text-[#10b981]">{summary.averagePercentage}%</span>
          </div>
        </div>

        {/* Behavioral Stats */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Behavioral Evals</h4>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {summary.behavioralFilled} <span className="text-sm font-normal text-slate-500">/ {summary.totalStudents} students</span>
          </p>
          <div className="mt-2 text-xs font-medium text-slate-500">
            {summary.behavioralFilled === summary.totalStudents ? (
              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Fully Evaluated</span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Needs Completion</span>
            )}
          </div>
        </div>

        {/* Remarks Stats */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <PenTool className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Remarks</h4>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {summary.remarksFilled} <span className="text-sm font-normal text-slate-500">/ {summary.totalStudents} students</span>
          </p>
          <div className="mt-2 text-xs font-medium text-slate-500">
            {summary.remarksFilled === summary.totalStudents ? (
              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Fully Commented</span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Needs Completion</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
