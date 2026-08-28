"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, BookOpen, Send, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import InviteStudentDialog from "./InviteStudentDialog";

interface InvitationsTableProps {
  searchTerm: string;
  page: number;
  onPageChange: (page: number) => void;
}

export default function InvitationsTable({ searchTerm, page, onPageChange }: InvitationsTableProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId;
  const { data: settings } = useSchoolSettings(schoolId!);
  const primaryColor = settings?.themeColor || '#2563eb';
  
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["school-students-invitations", schoolId, searchTerm, page],
    queryFn: () => adminService.getSchoolStudents(schoolId!, page, 10, searchTerm, { isClaimed: "false" }),
    enabled: !!schoolId,
  });

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const students = data?.data || [];

  const handleOpenInviteDialog = (student: any) => {
    setSelectedStudent(student);
    setIsInviteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10">
        Failed to fetch invitations list.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="p-5 w-16 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
              <th className="p-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
              <th className="p-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">System Email</th>
              <th className="p-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Class</th>
              <th className="p-5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student: any, index: number) => {
              const studentClass = student.classes?.[0]?.class;
              
              return (
                <tr
                  key={student.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-5 text-center text-sm font-semibold text-slate-400">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                         <User size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">{student.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{student.studentCode || 'UNASSIGNED'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <Mail size={16} className="text-slate-400" />
                      {student.email}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      {studentClass ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          <BookOpen size={16} />
                          {studentClass.name} {studentClass.section}
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-400 italic">No Class</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <Button 
                      onClick={() => handleOpenInviteDialog(student)}
                      style={{ backgroundColor: primaryColor }}
                      className="h-9 px-5 rounded-xl text-white font-semibold text-xs hover:opacity-90 transition-opacity border-none shadow-sm flex items-center whitespace-nowrap shrink-0"
                    >
                      <Send size={14} className="mr-2" /> Invite
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="p-16 text-center space-y-4">
          <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900 dark:text-white">No Pending Invitations</p>
            <p className="text-sm text-slate-500 font-medium">All students have claimed their accounts.</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs font-semibold text-slate-500">
            Displaying <span className="text-slate-900 dark:text-white">{(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)}</span> of <span className="text-slate-900 dark:text-white">{totalItems}</span> students
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {selectedStudent && (
        <InviteStudentDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          student={selectedStudent}
        />
      )}
    </div>
  );
}
