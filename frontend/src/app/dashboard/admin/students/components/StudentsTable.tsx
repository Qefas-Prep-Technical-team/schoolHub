"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { User, ShieldCheck, Mail, Hash, BookOpen, MoreVertical, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";

interface StatusChipProps {
  status: boolean;
}

const StatusChip = ({ status }: StatusChipProps) => {
  const isActive = status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
        isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-600" : "bg-amber-600"
        }`}
      />
      {isActive ? "Verified" : "Pending"}
    </span>
  );
};

interface StudentsTableProps {
  searchTerm: string;
  filters: {
    classId: string;
    gender: string;
    status: string;
  };
  page: number;
  onPageChange: (page: number) => void;
}

export default function StudentsTable({ searchTerm, filters, page, onPageChange }: StudentsTableProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId;
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["school-students", schoolId, searchTerm, filters, page],
    queryFn: () => adminService.getSchoolStudents(schoolId!, page, 10),
    enabled: !!schoolId,
  });

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const students = data?.data || [];

  const verifyMutation = useMutation({
    mutationFn: (studentId: string) => adminService.verifyStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-students"] });
    },
  });

  const handleVerify = (studentId: string) => {
    verifyMutation.mutate(studentId);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s: any) => s.id));
    }
    setSelectAll(!selectAll);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold">
        Failed to load students. Please try again later.
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <th className="p-6 w-10">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded-lg border-slate-300 focus:ring-primary accent-primary"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student ID</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Targeting</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {students.map((student: any) => {
            const isSelected = selectedIds.includes(student.id);
            const studentClass = student.classes?.[0]?.class;
            
            return (
              <tr
                key={student.id}
                className={`group transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/30 ${isSelected ? "bg-primary/5" : ""}`}
              >
                <td className="p-6">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary rounded-lg border-slate-300 focus:ring-primary accent-primary"
                    checked={isSelected}
                    onChange={() => toggleSelect(student.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <Link href={`/dashboard/admin/students/${student.id}`} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform overflow-hidden">
                       {student.profileImage ? (
                         <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                       ) : (
                         <User size={18} />
                       )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                        {student.name}
                        {student.verified && <ShieldCheck size={14} className="text-blue-500" />}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail size={10} /> {student.email}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg w-fit">
                        {student.studentCode}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     {student.gender || "—"}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {studentClass ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <BookOpen size={12} />
                        {studentClass.name} {studentClass.section}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No class assigned</span>
                    )}
                    {student.department && (
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        {student.department.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusChip status={student.verified} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!student.verified && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary hover:text-white border-none"
                        onClick={() => handleVerify(student.id)}
                        disabled={verifyMutation.isPending}
                      >
                        {verifyMutation.isPending && verifyMutation.variables === student.id ? "Verifying..." : "Verify"}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {students.length === 0 && (
        <div className="p-20 text-center flex flex-col items-center gap-4">
           <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
              <User size={32} />
           </div>
           <div>
              <h3 className="font-bold text-slate-900 dark:text-white">No students found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                There are no students linked to your school yet. Share your school code to start linking.
              </p>
           </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
          <div className="text-xs text-slate-500 font-bold">
            Showing <span className="text-slate-900 dark:text-white">{(page - 1) * 10 + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(page * 10, totalItems)}</span> of <span className="text-slate-900 dark:text-white">{totalItems}</span> students
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 w-8 p-0 border-slate-200 dark:border-slate-800"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 rounded-xl text-xs font-black p-0 ${p === page ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500"}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 w-8 p-0 border-slate-200 dark:border-slate-800"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

