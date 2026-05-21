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
      <div className="p-8 space-y-8 bg-slate-950/40 rounded-[3.5rem] backdrop-blur-3xl border border-white/5">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-20 text-center rounded-[3.5rem] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs">
        Failed to fetch invitations list.
      </div>
    );
  }

  return (
    <div className="rounded-[3.5rem] bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-3xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5">
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">System Email</th>
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Class</th>
              <th className="p-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {students.map((student: any) => {
              const studentClass = student.classes?.[0]?.class;
              
              return (
                <tr
                  key={student.id}
                  className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="size-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                           <User size={24} />
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.studentCode || 'UNASSIGNED'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <Mail size={14} />
                      {student.email}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      {studentClass ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          <BookOpen size={14} />
                          {studentClass.name} {studentClass.section}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">No Class</span>
                      )}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <Button 
                      onClick={() => handleOpenInviteDialog(student)}
                      style={{ backgroundColor: primaryColor }}
                      className="h-10 px-6 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all border-none"
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
        <div className="p-20 text-center space-y-6">
          <div className="size-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Pending Invitations</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">All students have claimed their accounts.</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-white/[0.01]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Displaying <span className="text-slate-900 dark:text-white">{(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)}</span> of <span className="text-slate-900 dark:text-white">{totalItems}</span> students
          </p>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 transition-all bg-white dark:bg-slate-900"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={20} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 transition-all bg-white dark:bg-slate-900"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={20} />
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
