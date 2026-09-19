import React from 'react';
import { useStudentAssignments, Assignment } from '@/lib/api/hooks/useAssignments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isPast } from 'date-fns';
import Link from 'next/link';

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
    <Card className="w-full h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Latest Assignments</CardTitle>
          </div>
          <Link href="/dashboard/student/assignments" className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-4 p-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : assignments.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.map(assignment => (
              <Link 
                key={assignment.id} 
                href={`/dashboard/student/assignments/${assignment.id}`}
                className="flex items-center justify-between p-4 md:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStatusIcon(assignment.status, assignment.dueDate)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
                      {assignment.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due {format(new Date(assignment.dueDate), "MMM d, h:mm a")}
                      </span>
                      {assignment.totalMarks && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span>{assignment.totalMarks} pts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${getStatusStyle(assignment.status, assignment.dueDate)}`}>
                    {getStatusText(assignment.status, assignment.dueDate)}
                  </span>
                  {assignment.status === 'graded' && assignment.grade && (
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                      Score: {assignment.grade}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">All caught up!</p>
            <p className="text-xs text-slate-500">You don't have any recent assignments.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
