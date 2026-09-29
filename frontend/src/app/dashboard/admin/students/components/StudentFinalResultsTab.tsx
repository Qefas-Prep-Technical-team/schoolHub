"use client";

import React, { useState } from 'react';
import { useMyPublishedResults } from '@/lib/api/hooks/useRecords';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { GraduationCap, BookOpen, ChevronRight, CheckCircle2, Clock, Eye, Download, FileText, FileSpreadsheet, FileBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FinalResultPDF } from './FinalResultPDF';

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

function getTermLabel(term: string): string {
  const map: Record<string, string> = { FIRST: "1st Term", SECOND: "2nd Term", THIRD: "3rd Term" };
  return map[term] || term;
}

function getTermGradient(term: string): string {
  const map: Record<string, string> = {
    FIRST:  "from-violet-600 to-indigo-600",
    SECOND: "from-rose-500 to-pink-600",
    THIRD:  "from-amber-500 to-orange-500",
  };
  return map[term] || "from-slate-600 to-slate-700";
}

function getTermAccent(term: string): string {
  const map: Record<string, string> = {
    FIRST:  "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300",
    SECOND: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300",
    THIRD:  "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  };
  return map[term] || "bg-slate-50 border-slate-200 text-slate-700";
}

function StatusBadge({ subjectCount, revealedCount }: { subjectCount: number; revealedCount: number }) {
  if (revealedCount === subjectCount) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-full px-2.5 py-1">
        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
        <span>All scores released</span>
      </div>
    );
  }
  if (revealedCount > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-full px-2.5 py-1">
        <Eye className="w-3 h-3 flex-shrink-0" />
        <span>{subjectCount - revealedCount > 0 ? `${subjectCount - revealedCount} hidden` : "Pending"}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-full px-2.5 py-1">
      <Clock className="w-3 h-3 flex-shrink-0" />
      <span>Scores pending</span>
    </div>
  );
}

export default function StudentFinalResultsTab({ studentId, primaryColor }: { studentId: string, primaryColor: string }) {
  const { data: finalResults, isLoading } = useMyPublishedResults(studentId);
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: schoolRes } = useSchoolSettings(schoolId);
  const school = schoolRes?.data;
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<any[] | null>(null);
  const [exportFilenamePrefix, setExportFilenamePrefix] = useState<string>('Academic_Results');
  const [isGenerating, setIsGenerating] = useState(false);

  if (isLoading) {
    return (
      <main className="w-full px-4 sm:px-6 lg:px-12 mt-10 pb-20 space-y-5">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-5 w-80 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </main>
    );
  }

  if (!finalResults || finalResults.length === 0) {
    return (
      <main className="w-full px-4 sm:px-6 lg:px-12 mt-10 pb-20">
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No Results Found</h2>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            No published final results found for this student.
          </p>
        </div>
      </main>
    );
  }

  const exportToCSV = (dataToExport: any[], filename: string) => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    // Flatten the grouped results for CSV
    const rows: any[] = [];
    dataToExport.forEach((group) => {
      const revealed = group.subjectResults?.filter((r: any) => r.scoresRevealed) || [];
      revealed.forEach((sub: any) => {
        const totalScore = (sub.assignmentScore || 0) + (sub.quizScore || 0) + (sub.caScore || 0) + (sub.examScore || 0);
        const percent = sub.classSubjectResult?.examMax ? Math.round((Number(totalScore) / 100) * 100) : totalScore;
        const { grade, remark } = getWAECGradeAndRemark(Number(percent));
        
        rows.push({
          "School Name": school?.name || "-",
          "Student Name": group.student?.name || sub.student?.name || "-",
          "Session": group.session?.name || "-",
          "Term": group.term || "-",
          "Class": group.class?.name || "-",
          "Subject": sub.resultName || sub.subject?.name || "-",
          "Subject Code": sub.subject?.code || "-",
          "CA Score": sub.caScore || 0,
          "Exam Score": sub.examScore || 0,
          "Total Score": totalScore,
          "Percentage": percent,
          "Grade": grade,
          "Remark": remark
        });
      });
    });

    if (rows.length === 0) {
      alert("No released scores to export.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  const exportToPDF = async (dataToExport: any[], filename: string) => {
    if (!dataToExport || dataToExport.length === 0) return;
    try {
      setIsGenerating(true);
      const student = dataToExport[0]?.student || {};
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <FinalResultPDF 
          student={student} 
          school={school} 
          results={dataToExport} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenExportModal = (target: any[], prefix: string) => {
    setExportTarget(target);
    setExportFilenamePrefix(prefix);
    setIsExportModalOpen(true);
  };

  const studentNameRaw = finalResults?.[0]?.student?.name || finalResults?.[0]?.subjectResults?.[0]?.student?.name || 'Student';
  const formattedStudentName = studentNameRaw.replace(/\s+/g, '_');
  const formattedSchoolName = school?.name ? school.name.replace(/\s+/g, '_') + '_' : '';

  return (
    <main className="w-full px-4 sm:px-6 lg:px-12 mt-10 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Results</h1>
          </div>
          <p className="text-slate-500 ml-12">
            {finalResults.length} term result{finalResults.length !== 1 ? "s" : ""} available. Click a card to view detailed transcript.
          </p>
        </div>
        
        <button 
          onClick={() => handleOpenExportModal(finalResults, `${formattedSchoolName}${formattedStudentName}_All_Academic_Results`)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm ml-12 sm:ml-0"
        >
          <Download className="w-4 h-4" />
          Export All Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {finalResults.map((group: any, idx: number) => {
          const subjectCount = group.subjectResults?.length || 0;
          const revealedCount = group.subjectResults?.filter((r: any) => r.scoresRevealed)?.length || 0;
          const gradient = getTermGradient(group.term);
          const accentClass = getTermAccent(group.term);

          return (
            <div
              key={`${group.sessionId}-${group.term}-${idx}`}
              className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer animate-in fade-in zoom-in-95"
              onClick={() => setSelectedGroup({ ...group, subjectCount, revealedCount })}
            >
              <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accentClass}`}>
                    {getTermLabel(group.term)}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
                  {group.class?.name || "Class"}
                </h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
                  {group.session?.name || "—"}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{subjectCount}</span>
                    <span>subject{subjectCount !== 1 ? "s" : ""}</span>
                  </div>
                  <StatusBadge subjectCount={subjectCount} revealedCount={revealedCount} />
                </div>
              </div>
              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {revealedCount === subjectCount ? "Full results available" : "View subject details"}
                </span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Result <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedGroup(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Transcript</h2>
                <p className="text-slate-500 mt-1">{selectedGroup.class?.name} • {getTermLabel(selectedGroup.term)} • {selectedGroup.session?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleOpenExportModal([selectedGroup], `${school?.name ? school.name.replace(/\s+/g, '_') + '_' : ''}${selectedGroup.student?.name?.replace(/\s+/g, '_')}_${getTermLabel(selectedGroup.term)}_${selectedGroup.session?.name?.replace(/\s+/g, '_')}`)}
                  className="px-4 py-2 flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button onClick={() => setSelectedGroup(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Close
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
                <div><p className="text-xs text-slate-500">Student Name</p><p className="font-semibold text-slate-800 dark:text-white">{selectedGroup.student?.name}</p></div>
                <div><p className="text-xs text-slate-500">Subjects</p><p className="font-semibold text-slate-800 dark:text-white">{selectedGroup.subjectCount}</p></div>
                <div>
                  <p className="text-xs text-slate-500">Overall Average</p>
                  <p className="font-semibold" style={{ color: primaryColor }}>
                    {(() => {
                      const revealed = selectedGroup.subjectResults?.filter((r: any) => r.scoresRevealed) || [];
                      if (revealed.length === 0) return '-';
                      let sum = 0;
                      revealed.forEach((r: any) => {
                        const totalScore = (r.assignmentScore || 0) + (r.quizScore || 0) + (r.caScore || 0) + (r.examScore || 0);
                        const percent = r.classSubjectResult?.examMax ? Math.round((Number(totalScore) / 100) * 100) : totalScore;
                        sum += Number(percent);
                      });
                      return `${Math.round(sum / revealed.length)}%`;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <div className="mt-1"><StatusBadge subjectCount={selectedGroup.subjectCount} revealedCount={selectedGroup.revealedCount} /></div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-3 font-medium">Subject</th>
                      <th className="py-3 font-medium text-center">Score</th>
                      <th className="py-3 font-medium text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedGroup.subjectResults || []).map((sub: any, idx: number) => {
                      let totalScore: number | string = '-';
                      let percent: number | string = '-';
                      let grade = "-";
                      let color = "text-slate-500 bg-slate-100 dark:bg-slate-800";
                      
                      if (sub.scoresRevealed) {
                        totalScore = (sub.assignmentScore || 0) + (sub.quizScore || 0) + (sub.caScore || 0) + (sub.examScore || 0);
                        percent = sub.classSubjectResult?.examMax ? Math.round((Number(totalScore) / 100) * 100) : totalScore;
                        const waec = getWAECGradeAndRemark(Number(percent));
                        grade = waec.grade;
                        if (Number(percent) >= 75) { color = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400"; }
                        else if (Number(percent) >= 65) { color = "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"; }
                        else if (Number(percent) >= 50) { color = "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400"; }
                        else { color = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"; }
                      }

                      return (
                        <tr key={idx} className="text-slate-800 dark:text-slate-200">
                          <td className="py-3 font-semibold">
                            {sub.resultName || sub.subject?.name}
                            <div className="text-xs font-medium text-slate-400 mt-0.5">{sub.subject?.code}</div>
                          </td>
                          <td className="py-3 text-center font-bold">
                            {sub.scoresRevealed ? `${percent}%` : <span className="text-xs text-slate-400">PENDING</span>}
                          </td>
                          <td className="py-3 text-center">
                            <span className={cn("px-3 py-1 rounded-md text-xs font-bold inline-block shadow-sm", color)}>
                              {sub.scoresRevealed ? grade : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border-none shadow-3xl">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                <FileBox size={28} />
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Export Results
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Choose your preferred download format
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button
              onClick={() => exportTarget && exportToPDF(exportTarget, `${exportFilenamePrefix}.pdf`)}
              disabled={isGenerating}
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">PDF Report</h3>
                  <p className="text-xs text-slate-500 font-medium">Professional document format</p>
                </div>
              </div>
              <Download size={20} className="text-indigo-600" />
            </button>

            <button
              onClick={() => exportTarget && exportToCSV(exportTarget, `${exportFilenamePrefix}.csv`)}
              disabled={isGenerating}
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">CSV Data</h3>
                  <p className="text-xs text-slate-500 font-medium">Spreadsheet for analysis</p>
                </div>
              </div>
              <Download size={20} className="text-emerald-600" />
            </button>
          </div>
          
          <div className="mt-8 text-center">
            {isGenerating && <p className="text-sm font-medium text-indigo-600 animate-pulse">Generating document, please wait...</p>}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
