"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { examService } from "@/lib/api/services/examService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentResultsListProps {
  examId: string;
  paperId: string;
}

interface StudentResult {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  score: number | string;
  totalMarks: number | string;
  status: string;
  submittedAt: string | null;
}

export default function StudentResultsList({ examId, paperId }: StudentResultsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const itemsPerPage = 5;

  const { data: paperData, isLoading } = useQuery({
    queryKey: ["paper", paperId],
    queryFn: () => examService.getPaperById(examId, paperId),
    enabled: !!paperId,
  });

  const validAttempts = useMemo(() => {
    if (!paperData) return [];
    
    // Normalize and merge results from online attempts and manual grades
    const onlineResults = (paperData.examAttempts || []).map((a: any) => {
      const student = a.examAttempt?.student;
      const firstName = student?.firstName || "";
      const lastName = student?.lastName || "";
      const name = student?.name || (firstName || lastName ? `${firstName} ${lastName}` : "Unknown Student");
      
      let initials = "U";
      if (firstName || lastName) {
        initials = (firstName[0] || "") + (lastName[0] || "");
      } else if (name && name !== "Unknown Student") {
        const parts = name.trim().split(" ");
        initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : (name[0] || "U");
      }
      initials = initials.toUpperCase() || "U";
      
      return {
        id: a.id,
        name,
        initials,
        avatar: student?.avatar,
        studentCode: student?.studentCode,
        score: a.score as number || 0,
        totalMarks: a.totalMarks || paperData.totalMarks || '-',
        status: a.status || "SUBMITTED",
        submittedAt: a.examAttempt?.submittedAt || a.updatedAt || null,
        type: 'ONLINE'
      };
    });

    const gradesResults = (paperData.grades || []).map((g: any) => {
      const student = g.student;
      const firstName = student?.firstName || "";
      const lastName = student?.lastName || "";
      const name = student?.name || (firstName || lastName ? `${firstName} ${lastName}` : "Unknown Student");
      
      let initials = "U";
      if (firstName || lastName) {
        initials = (firstName[0] || "") + (lastName[0] || "");
      } else if (name && name !== "Unknown Student") {
        const parts = name.trim().split(" ");
        initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : (name[0] || "U");
      }
      initials = initials.toUpperCase() || "U";

      return {
        id: g.id,
        name,
        initials,
        avatar: student?.avatar,
        studentCode: student?.studentCode,
        score: g.score as number || 0,
        totalMarks: g.maxMarks || paperData.totalMarks || '-',
        status: "SCORED",
        submittedAt: g.createdAt || null,
        type: g.examAttemptId ? 'ONLINE' : 'MANUAL'
      };
    });

    const allResultsMap = new Map<string, StudentResult>();
    
    onlineResults.forEach((r: any) => {
      if (r.studentCode || r.name) {
        allResultsMap.set(r.studentCode || r.name, r);
      }
    });

    gradesResults.forEach((r: any) => {
      if (r.studentCode || r.name) {
        // Grades override online attempts if they exist
        allResultsMap.set(r.studentCode || r.name, r);
      }
    });

    return Array.from(allResultsMap.values());
  }, [paperData]);

  const totalPages = Math.ceil(validAttempts.length / itemsPerPage);
  const paginatedAttempts = validAttempts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (validAttempts.length === 0) {
    return (
      <div className="text-center p-4 text-sm text-gray-500">
        No students have submitted this paper yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Students ({validAttempts.length})</h4>
      </div>

      <div className="space-y-2">
        {paginatedAttempts.map((result) => {
          return (
            <div 
              key={result.id} 
              onClick={() => setSelectedResult(result)}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
                <AvatarImage src={result.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{result.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{result.name}</p>
                <p className="text-[10px] text-slate-500">
                  {result.score !== undefined ? `${result.score} / ${result.totalMarks}` : result.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={14} /> Prev
          </Button>
          <span className="text-[10px] font-medium text-slate-500">{currentPage} of {totalPages}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Result Details</DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={selectedResult.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{selectedResult.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedResult.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Status: {selectedResult.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-none">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Score Obtained</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {selectedResult.score ?? '-'}
                  </p>
                </Card>
                <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-none">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Marks</p>
                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                    {selectedResult.totalMarks ?? '-'}
                  </p>
                </Card>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl flex items-start gap-3">
                <Clock className="text-blue-500 mt-0.5" size={16} />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-0.5">Submission Time</p>
                  <p className="text-xs opacity-80">
                    {selectedResult.submittedAt 
                      ? new Date(selectedResult.submittedAt).toLocaleString() 
                      : "Not recorded"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
