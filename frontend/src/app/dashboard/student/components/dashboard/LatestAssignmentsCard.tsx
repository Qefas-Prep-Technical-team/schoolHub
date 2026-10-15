import React from 'react';
import { useStudentAssignments, Assignment } from '@/lib/api/hooks/useAssignments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, ChevronRight, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isPast } from 'date-fns';
import Link from 'next/link';
import { HeaderTooltip } from './HeaderTooltip';

export default function LatestAssignmentsCard() {
  const { data, isLoading } = useStudentAssignments({ limit: 5 });
  const assignments: Assignment[] = data?.assignments || [];

  const getStatusIcon = (status: Assignment['status'], dueDate: string) => {
    if (status === 'graded') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === 'submitted') return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (status === 'overdue' || (status === 'pending' && isPast(new Date(dueDate)))) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const getStatusStyle = (status: Assignment['status'], dueDate: string) => {
    if (status === 'graded') return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    if (status === 'submitted') return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
    if (status === 'overdue' || (status === 'pending' && isPast(new Date(dueDate)))) {
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
    }
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
  };
  
  const getStatusText = (status: Assignment['status'], dueDate: string) => {
    if (status === 'pending' && isPast(new Date(dueDate))) return "Overdue";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="w-full h-full bg-white dark:bg-zinc-950/80 border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Latest Assignments</CardTitle>
              <HeaderTooltip content="Active homework tasks, project submissions, and graded coursework assigned by your teachers." />
            </div>
          </div>
          <Link href="/dashboard/student/assignments" className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors flex items-center gap-0.5 shrink-0">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : assignments.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {assignments.map(assignment => (
              <Link 
                key={assignment.id} 
                href={`/dashboard/student/assignments/${assignment.id}`}
                className="flex items-center justify-between p-3.5 sm:p-4 md:px-5 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors group cursor-pointer gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-1 shrink-0">
                    {getStatusIcon(assignment.status, assignment.dueDate)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base text-slate-800 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors truncate">
                      {assignment.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {format(new Date(assignment.dueDate), "MMM d, h:mm a")}
                      </span>
                      {assignment.totalMarks && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                          <span>{assignment.totalMarks} pts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border ${getStatusStyle(assignment.status, assignment.dueDate)}`}>
                    {getStatusText(assignment.status, assignment.dueDate)}
                  </span>
                  {assignment.status === 'graded' && assignment.grade && (
                    <span className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-zinc-300">
                      Score: {assignment.grade}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 sm:px-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mb-2.5">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 dark:text-zinc-600" />
            </div>
            <p className="font-bold text-sm sm:text-base text-slate-700 dark:text-zinc-300 mb-0.5">All caught up!</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">You don't have any pending assignments.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
